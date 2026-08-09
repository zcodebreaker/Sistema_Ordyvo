using Codev_V2;
using Codev_V2.Web;
using HandyControl.Controls;
using System.Windows;
using System.Windows.Controls;

namespace Codev_V2.Páginas
{
    public partial class DetalhesClientes : Page
    {
        private readonly Api.Clientes _clienteSelecionado;

        public DetalhesClientes(Api.Clientes cliente)
        {
            InitializeComponent();
            _clienteSelecionado = cliente;

            Loaded += DetalhesClientes_Loaded;
        }

        private async void DetalhesClientes_Loaded(object sender, RoutedEventArgs e)
        {
            CarregarDadosCliente();
            ConfigurarCampos();

            // CORRIGIDO: Chamando o método correto (plural) que retorna lista
            var aparelhos = await Api.BuscarAparelhosPorClienteAsync(_clienteSelecionado.Id);

            if (aparelhos != null && aparelhos.Any())
            {
                // Pegando o primeiro aparelho (ou você pode exibir todos em uma lista)
                var aparelho = aparelhos.First();
                Marca_.Text = aparelho.Marca;
                Aparelho_.Text = aparelho.Aparelho;
                Defeito_.Text = aparelho.Defeito;
            }
            else
            {
                Marca_.Text = "";
                Aparelho_.Text = "";
                Defeito_.Text = "";
            }
        }
        private void CarregarDadosCliente()
        {
            Clientes_.Text = _clienteSelecionado.Cliente;
            Endereço_.Text = _clienteSelecionado.Endereço;
            Número_.Text = _clienteSelecionado.Numero.ToString();
            Bairro_.Text = _clienteSelecionado.Bairro;
        }
        private void ConfigurarCampos()
        {
            Clientes_.IsReadOnly = true;
            Endereço_.IsReadOnly = true;
            Número_.IsReadOnly = true;
            Bairro_.IsReadOnly = true;
            Marca_.IsReadOnly = true;
            Aparelho_.IsReadOnly = true;
            Defeito_.IsReadOnly = true;
        }
        private async void Deletar_Click(object sender, RoutedEventArgs e)
        {
            var resultado = System.Windows.MessageBox.Show(
              $"Tem certeza que deseja deletar o cliente {_clienteSelecionado.Cliente}?",
              "Confirmar exclusão",
              MessageBoxButton.YesNo,
              MessageBoxImage.Warning);

            if (resultado != MessageBoxResult.Yes)
                return;

            var sucesso = await Api.DeletarClienteAsync(_clienteSelecionado.Id);

            if (!sucesso)
            {
                System.Windows.MessageBox.Show("Erro ao deletar cliente.", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }
            System.Windows.MessageBox.Show("Cliente deletado com sucesso.", "Sucesso", MessageBoxButton.OK, MessageBoxImage.Information);

            if (NavigationService != null && NavigationService.CanGoBack) NavigationService.GoBack();
        }
        private void Voltar_Click(object sender, RoutedEventArgs e)
        {
            if (NavigationService != null && NavigationService.CanGoBack) NavigationService.GoBack();
        }
    }
}