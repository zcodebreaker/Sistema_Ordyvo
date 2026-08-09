using Codev_V2.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;

namespace Codev_V2.Páginas
{
    public class ClienteCard
    {
        public int Id { get; set; }
        public string Cliente { get; set; } = "";
        public string Endereço { get; set; } = "";
        public int Numero { get; set; }
        public string Bairro { get; set; } = "";

        public string IdFormatado => $"#{Id:D3}";
        public string EnderecoCompleto => $"{Endereço}, {Numero}";
    }

    public partial class PaginaIncial : Page
    {
        public PaginaIncial()
        {
            InitializeComponent();
        }

        private async void Page_Loaded(object sender, RoutedEventArgs e)
        {
            try
            {
                var clientes = await Api.ListarClientesAsync();

                if (clientes == null || !clientes.Any())
                {
                    EmptyState.Visibility = Visibility.Visible;
                    CardsContainer.Visibility = Visibility.Collapsed;
                    return;
                }

                var cards = clientes
                    .OrderByDescending(c => c.Id)
                    .Take(12)
                    .Select(c => new ClienteCard
                    {
                        Id = c.Id,
                        Cliente = c.Cliente,
                        Endereço = c.Endereço,
                        Numero = c.Numero,
                        Bairro = c.Bairro
                    })
                    .ToList();

                CardsContainer.ItemsSource = cards;
                EmptyState.Visibility = Visibility.Collapsed;
                CardsContainer.Visibility = Visibility.Visible;
            }
            catch
            {
                EmptyState.Visibility = Visibility.Visible;
                CardsContainer.Visibility = Visibility.Collapsed;
            }
        }
    }
}
