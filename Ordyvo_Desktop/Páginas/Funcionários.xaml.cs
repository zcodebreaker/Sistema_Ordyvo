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

namespace Codev_V2.Páginas
{
    /// <summary>
    /// Interação lógica para Funcionários.xam
    /// </summary>
    public partial class Funcionários : Page
    {
        public Funcionários()
        {
            InitializeComponent();
        }
        public async Task ListFuncionários()
        {
            CodevFuncionarios.ItemsSource = await Web.Api.ListarFuncionariosAsync();
        }
        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            await ListFuncionários();
        }
    }
}
