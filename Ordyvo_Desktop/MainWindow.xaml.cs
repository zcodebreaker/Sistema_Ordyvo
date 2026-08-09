using Codev_V2;
using Codev_V2.Functions;
using Codev_V2.Páginas;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;

namespace Codev_V2
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        public MainWindow(string usuário)
        {
            InitializeComponent();
            Usuário_conectado.Text = usuário;
        }
        private void Fechar_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Você deseja sair?", "Aviso", MessageBoxButton.OKCancel, MessageBoxImage.Warning);
            if (result == MessageBoxResult.OK)
            {
                Application.Current.Shutdown();
            }
        }
        private void Clientes_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new Clientes());
        }
        private void Inicio_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new PaginaIncial());
        }
        private void Conta_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new Cadastro());
        }
        private void Sobre_Click(object sender, RoutedEventArgs e)
        {
            MessageBox.Show("Página desativada ou removida.", "Informação", MessageBoxButton.OK, MessageBoxImage.Information);
        }
        private void Logout_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Deseja encerrar a sessão?", "Logout", MessageBoxButton.OKCancel, MessageBoxImage.Information);
            if (result != MessageBoxResult.OK) return;
            RegistrarLogin.Clear();
            var login = new LoginWindow();
            login.Show();
            Close();
        }
        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            var fade = new DoubleAnimation
            {
                From = 0,
                To = 1,
                Duration = TimeSpan.FromMilliseconds(100)
            };
            BeginAnimation(OpacityProperty, fade);
            MainFrame.Navigate(new PaginaIncial());
        }
        private void Window_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
                DragMove();
        }
        private void Funcionários_Click(object sender, RoutedEventArgs e)
        {
            MainFrame.Navigate(new Funcionários());
        }
    }
}