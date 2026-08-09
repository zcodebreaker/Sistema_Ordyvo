using Codev_V2;
using Codev_V2.Web;
using System;
using System.Collections.Generic;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using static Codev_V2.Web.Api;

namespace Codev_V2.Páginas
{
    /// <summary>
    /// Interação lógica para Inicio.xam
    /// </summary>
    public partial class Cadastro : Page
    {
        public Cadastro()
        {
            InitializeComponent();
        }
        private async void Salvar__Click(object sender, RoutedEventArgs e)
        {
            var cliente = Clientes_.Text.Trim();
            var endereco = Endereço_.Text.Trim();
            var bairro = Bairro_.Text.Trim();
            var marca = Marca_.Text.Trim();
            var aparelho = Aparelho_.Text.Trim();
            var defeito = Defeito_.Text.Trim();

            if (string.IsNullOrWhiteSpace(cliente) ||
                string.IsNullOrWhiteSpace(endereco) ||
                string.IsNullOrWhiteSpace(bairro) ||
                string.IsNullOrWhiteSpace(marca) ||
                string.IsNullOrWhiteSpace(aparelho) ||
                string.IsNullOrWhiteSpace(defeito))
            {
                MessageBox.Show("Preencha todos os campos.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (!int.TryParse(Número_.Text, out int numero))
            {
                MessageBox.Show("Insira um número válido.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var novoCliente = new Api.Clientes
            {
                Cliente = cliente,
                Endereço = endereco,
                Bairro = bairro,
                Numero = numero
            };

            var clienteCriado = await CriarClientesAsync(novoCliente);

            if (clienteCriado == null)
            {
                MessageBox.Show("Erro ao cadastrar cliente.", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            var novoAparelho = new Api.Aparelhos
            {
                Marca = marca,
                Aparelho = aparelho,
                Defeito = defeito,
                Clientes = new Api.Clientes
                {
                    Id = clienteCriado.Id
                }
            };
            var aparelhoCriado = await CriarAparelhoAsync(novoAparelho);

            if (!aparelhoCriado)
            {
                MessageBox.Show("Cliente cadastrado, mas houve erro ao cadastrar o aparelho.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            MessageBox.Show("Dados cadastrados com sucesso.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Information);

            Clientes_.Text = "";
            Endereço_.Text = "";
            Bairro_.Text = "";
            Número_.Text = "";
            Marca_.Text = "";
            Aparelho_.Text = "";
            Defeito_.Text = "";
        }
        private void Limpar__Click(object sender, RoutedEventArgs e)
        {
            Clientes_.Text = "";
            Endereço_.Text = "";
            Bairro_.Text = "";
            Número_.Text = "";
            Marca_.Text = "";
            Aparelho_.Text = "";
            Defeito_.Text = "";

            MessageBox.Show("Todos os campos foram limpos.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Information);
        }
    }
}
