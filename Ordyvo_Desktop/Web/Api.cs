using Codev_V2;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Reflection.Metadata;
using System.Security.RightsManagement;
using System.Text;
using System.Text.Json.Serialization;
using System.Windows;

namespace Codev_V2.Web
{
    public static class Api
    {
        public static HttpClient Http = new()
        {
            BaseAddress = new Uri("https://localhost:7097")
        };
        public static async Task<bool>DBAsync()
        {
            try
            {
                var resp = await Http.GetAsync("api/db");
                return resp.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        public class LoginResponse
        {
            public int UserId {get;set;}
            public string Username {get;set;} = "";
        }
        public static async Task<LoginResponse?>LoginAsync(string username, string password)
        {
            var resp = await Http.PostAsJsonAsync("api/auth/login", new {username, password});
            if (!resp.IsSuccessStatusCode)
                return null;
            return await resp.Content.ReadFromJsonAsync<LoginResponse>();
        }
        public class Aparelhos
        {
            public int Id { get; set; }
            public string Marca { get; set; } = "";
            public string Aparelho { get; set; } = "";
            public string Defeito { get; set; } = "";
            public Clientes? Clientes { get; set; }
        }
        public class Clientes
        {
            public int Id { get; set; }
            public string Cliente { get; set; } = "";
            public string Endereço { get; set; } = "";
            public int Numero { get; set; }
            public string Bairro { get; set; } = "";

            [JsonIgnore]
            public List<Aparelhos> Aparelhos { get; set; } = new();
        }
        public class Funcionario
        {
            public int Id { get; set; }
            public string Nome { get; set; } = "";
            public string Função { get; set; } = "";
            public DateTime Data_Entrada { get; set; } = DateTime.Now;
        }
        public static async Task<List<Clientes>?>ListarClientesAsync()
        {
            return await Http.GetFromJsonAsync<List<Clientes>>("/api/client");
        }
        public static async Task<Api.Clientes?>CriarClientesAsync(Clientes cliente)
        {
            try
            {
                var response = await Http.PostAsJsonAsync("api/client", cliente);

                if (!response.IsSuccessStatusCode)
                    return null;

                var clienteCriado = await response.Content.ReadFromJsonAsync<Api.Clientes>();
                return clienteCriado;
            }
            catch
            {
                return null;
            }
        }
        public static async Task<bool> CriarAparelhoAsync(Api.Aparelhos aparelho)
        {
            try
            {
                var response = await Http.PostAsJsonAsync("api/aparelho", aparelho);
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro aparelho: {ex.Message}");
                return false;
            }
        }
        public static async Task<List<Api.Aparelhos>?>BuscarAparelhosPorClienteAsync(int clienteId)
        {
            try
            {
                var response = await Http.GetAsync($"api/aparelho/client/{clienteId}");
                if (!response.IsSuccessStatusCode)
                    return null;
                return await response.Content.ReadFromJsonAsync<List<Api.Aparelhos>>();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erro ao buscar aparelhos: {ex.Message}");
                return null;
            }
        }
        public static async Task<bool> DeletarClienteAsync(int id)
        {
            try
            {
                var response = await Http.DeleteAsync($"api/client/{id}");
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        public static async Task<List<Funcionario>?>ListarFuncionariosAsync()
        {
            try
            {
                return await Http.GetFromJsonAsync<List<Funcionario>>("api/funcionario");
            }
            catch
            {
                return null;
            }
        }

        public static async Task<bool> CriarFuncionarioAsync(Funcionario funcionario)
        {
            try
            {
                var response = await Http.PostAsJsonAsync("api/funcionario", funcionario);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        // ──────────────────────────────────────── Auth Register by Claude Code ───────────────────────────────────────────────//
        public class NovoUser
        {
            [JsonPropertyName("username")]
            public string Username { get; set; } = "";

            [JsonPropertyName("password")]
            public string Password { get; set; } = "";

            [JsonPropertyName("role")]
            public string Role { get; set; } = "user";
        }
        public static async Task<bool> RegistrarUsuarioAsync(NovoUser user)
        {
            try
            {
                var response = await Http.PostAsJsonAsync("api/auth/register", user);
                return response.IsSuccessStatusCode;
            }
            catch
            {
                return false;
            }
        }
        // ──────────────────────────────────────── Auth Register by Claude Code ───────────────────────────────────────────────//
    }
}
