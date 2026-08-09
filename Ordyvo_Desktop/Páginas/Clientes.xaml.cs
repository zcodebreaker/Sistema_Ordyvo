using Codev_V2.Web;
using System;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
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

namespace Codev_V2.Páginas
{
    /// <summary>
    /// Interação lógica para Clientes.xam
    /// </summary>
    public partial class Clientes : Page
    {
        public Clientes()
        {
            InitializeComponent();
        }
        public async Task ListClientes()
        {
            CodevClientes.ItemsSource = await Web.Api.ListarClientesAsync();
        }
        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await ListClientes();
        }
        private void CodevClientes_MouseDoubleClick(object sender, MouseButtonEventArgs e)
        {
            if (CodevClientes.SelectedItem is Api.Clientes clienteSelecionado)
            {
                NavigationService?.Navigate(new DetalhesClientes(clienteSelecionado));
            }

        }
    }
}
