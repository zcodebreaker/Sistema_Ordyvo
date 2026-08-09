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
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace Codev_V2
{
    /// <summary>
    /// Lógica interna para Splash.xaml
    /// </summary>
    public partial class Splash
    {
        public Splash()
        {
            InitializeComponent();
        }
        private async void Window_Loaded(object sender, RoutedEventArgs e)
        {
            var fade = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(100)
            };
            BeginAnimation(OpacityProperty, fade);
            var ok = await Api.DBAsync();
            if (!ok)
            {
                MessageBox.Show("Não foi possível conectar ao banco de dados.", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
                Application.Current.Shutdown();
                return;
            }
            new LoginWindow().Show();
            Close();
        }
    }
}
