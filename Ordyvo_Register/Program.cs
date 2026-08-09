using System.Net.Http.Json;
using System.Text.Json.Serialization;

// ─── Configuração ───────────────────────────────────────────────────────────
const string BASE_URL = "https://localhost:7097";
using var http = new HttpClient(new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (_, _, _, _) => true // aceita cert local
})
{
    BaseAddress = new Uri(BASE_URL)
};

// ─── Helpers de console ─────────────────────────────────────────────────────
void Titulo(string texto)
{
    Console.ForegroundColor = ConsoleColor.Cyan;
    Console.WriteLine($"\n  ╔══════════════════════════════════╗");
    Console.WriteLine($"  ║{texto,-34}║");
    Console.WriteLine($"  ╚══════════════════════════════════╝\n");
    Console.ResetColor();
}

void Ok(string msg)
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine($"{msg}");
    Console.ResetColor();
}

void Erro(string msg)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"{msg}");
    Console.ResetColor();
}

void Aviso(string msg)
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine($"{msg}");
    Console.ResetColor();
}

string LerCampo(string label, bool obrigatorio = true)
{
    while (true)
    {
        Console.ForegroundColor = ConsoleColor.DarkGray;
        Console.Write($"  {label}: ");
        Console.ResetColor();
        var valor = Console.ReadLine()?.Trim() ?? "";
        if (!obrigatorio || !string.IsNullOrWhiteSpace(valor)) return valor;
        Aviso("Este campo é obrigatório.");
    }
}

string LerSenha(string label)
{
    Console.ForegroundColor = ConsoleColor.DarkGray;
    Console.Write($"  {label}: ");
    Console.ResetColor();

    var senha = new System.Text.StringBuilder();
    ConsoleKeyInfo key;
    while ((key = Console.ReadKey(intercept: true)).Key != ConsoleKey.Enter)
    {
        if (key.Key == ConsoleKey.Backspace && senha.Length > 0)
        {
            senha.Remove(senha.Length - 1, 1);
            Console.Write("\b \b");
        }
        else if (key.Key != ConsoleKey.Backspace)
        {
            senha.Append(key.KeyChar);
            Console.Write("*");
        }
    }
    Console.WriteLine();
    return senha.ToString();
}

// ─── Verificar conexão com a API ─────────────────────────────────────────────
async Task<bool> VerificarConexao()
{
    try
    {
        var resp = await http.GetAsync("api/db");
        return resp.IsSuccessStatusCode;
    }
    catch
    {
        return false;
    }
}

// ─── Cadastrar Funcionário ────────────────────────────────────────────────────
async Task CadastrarFuncionario()
{
    Titulo("CADASTRAR FUNCIONÁRIO");

    var nome = LerCampo("Nome completo");
    var funcao = LerCampo("Função / Cargo");
    var dataRaw = LerCampo("Data de entrada (dd/MM/yyyy)");

    if (!DateTime.TryParseExact(dataRaw, "dd/MM/yyyy",
            System.Globalization.CultureInfo.InvariantCulture,
            System.Globalization.DateTimeStyles.None, out var dataEntrada))
    {
        Erro("Data inválida. Use o formato dd/MM/yyyy.");
        return;
    }

    var payload = new NovoFuncionario
    {
        Nome = nome,
        Funcao = funcao,
        DataEntrada = dataEntrada.ToString("yyyy-MM-dd")
    };

    try
    {
        var resp = await http.PostAsJsonAsync("api/funcionario", payload);
        if (resp.IsSuccessStatusCode)
            Ok($"Funcionário \"{nome}\" cadastrado com sucesso!");
        else
        {
            var body = await resp.Content.ReadAsStringAsync();
            Erro($"Falha ({(int)resp.StatusCode}): {body}");
        }
    }
    catch (Exception ex)
    {
        Erro($"Erro de conexão: {ex.Message}");
    }
}

// ─── Cadastrar User ───────────────────────────────────────────────────────────
async Task CadastrarUser()
{
    Titulo("CADASTRAR USUÁRIO DO SISTEMA");

    var username = LerCampo("Username");
    var senha = LerSenha("Senha");
    var confirma = LerSenha("Confirmar senha");

    if (senha != confirma)
    {
        Erro("As senhas não coincidem.");
        return;
    }

    if (senha.Length < 4)
    {
        Aviso("Senha muito curta. Use pelo menos 4 caracteres.");
        return;
    }

    Console.ForegroundColor = ConsoleColor.DarkGray;
    Console.Write("  Role (admin/user) [padrão: user]: ");
    Console.ResetColor();
    var roleInput = Console.ReadLine()?.Trim().ToLower() ?? "";
    var role = (roleInput == "admin") ? "admin" : "user";

    var payload = new NovoUser
    {
        Username = username,
        Password = senha,
        Role = role
    };

    try
    {
        var resp = await http.PostAsJsonAsync("api/auth/register", payload);
        if (resp.IsSuccessStatusCode)
            Ok($"Usuário \"{username}\" cadastrado com role \"{role}\"!");
        else
        {
            var body = await resp.Content.ReadAsStringAsync();
            Erro($"Falha ({(int)resp.StatusCode}): {body}");
        }
    }
    catch (Exception ex)
    {
        Erro($"Erro de conexão: {ex.Message}");
    }
}

// ─── Menu principal ───────────────────────────────────────────────────────────
Console.Title = "Project Codev — Administração";
Console.OutputEncoding = System.Text.Encoding.UTF8;

Console.Clear();
Titulo("PROJECT CODEV  —  Administração");

Console.ForegroundColor = ConsoleColor.DarkGray;
Console.WriteLine($"  Conectando à API em {BASE_URL}...");
Console.ResetColor();

var conectado = await VerificarConexao();
if (!conectado)
{
    Erro("Não foi possível conectar ao banco de dados.");
    Aviso("Verifique se a API está em execução e tente novamente.");
    Console.WriteLine("\n  Pressione qualquer tecla para sair...");
    Console.ReadKey();
    return;
}

Ok("Conexão estabelecida com sucesso.");

while (true)
{
    Console.WriteLine();
    Console.ForegroundColor = ConsoleColor.White;
    Console.WriteLine("  ┌──────────────────────────────────────┐");
    Console.WriteLine("  │  [1]  Registrar Funcionário          │");
    Console.WriteLine("  │  [2]  Cadastrar Usuário              │");
    Console.WriteLine("  │  [0]  Sair                           │");
    Console.WriteLine("  └──────────────────────────────────────┘");
    Console.ResetColor();

    Console.ForegroundColor = ConsoleColor.Cyan;
    Console.Write("\n  Opção: ");
    Console.ResetColor();
    var opcao = Console.ReadLine()?.Trim();

    switch (opcao)
    {
        case "1":
            await CadastrarFuncionario();
            break;
        case "2":
            await CadastrarUser();
            break;
        case "0":
            Ok("Saindo...");
            return;
        default:
            Aviso("Opção inválida. Digite 1, 2 ou 0.");
            break;
    }

    Console.ForegroundColor = ConsoleColor.DarkGray;
    Console.Write("\n  Pressione qualquer tecla para voltar ao menu...");
    Console.ResetColor();
    Console.ReadKey();
    Console.Clear();
    Titulo("PROJECT CODEV  —  Administração");
    Ok("Conexão ativa.");
}

// ─── Modelos — DEVEM ficar após todo o código executável (regra do C#) ────────
class NovoFuncionario
{
    [JsonPropertyName("nome")]
    public string Nome { get; set; } = "";

    [JsonPropertyName("funcao")]
    public string Funcao { get; set; } = "";

    [JsonPropertyName("dataEntrada")]
    public string DataEntrada { get; set; } = "";
}

class NovoUser
{
    [JsonPropertyName("username")]
    public string Username { get; set; } = "";

    [JsonPropertyName("password")]
    public string Password { get; set; } = "";

    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";
}
