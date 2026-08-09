using Codev_V2.Functions;
using Codev_V2.Web;
using System;
using System.Collections.Generic;
using System.Net.Security;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Controls.Primitives;
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
    /// Lógica interna para LoginWindow.xaml
    /// </summary>
    public partial class LoginWindow
    {
        public LoginWindow()
        {
            InitializeComponent();
        }
        private void Fechar_Click(object sender, RoutedEventArgs e)
        {
            var result = MessageBox.Show("Você deseja sair?", "Aviso", MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (result == MessageBoxResult.Yes)
            {
                Application.Current.Shutdown();
            }
        }
        private void SalvarLogin_Checked(object sender, RoutedEventArgs e)
        {
            RegistrarLogin.Save(User_.Text.Trim(), Pass_.Password);
        }
        private void SalvarLogin_Unchecked(object sender, RoutedEventArgs e)
        {
            RegistrarLogin.Clear();
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
            var (user, pass) = RegistrarLogin.Load();
            User_.Text = user;
            Pass_.Password = pass;
            SalvarLogin.IsChecked = !string.IsNullOrWhiteSpace(pass);
        }
        private void Window_MouseDown(object sender, MouseButtonEventArgs e)
        {
            if (e.LeftButton == MouseButtonState.Pressed)
                DragMove();
        }
        private void RecuperarSenha_Click(object sender, MouseButtonEventArgs e)
        {
            MessageBox.Show("Funcionalidade de recuperação de senha ainda não implementada.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
        }
        private async void Button_Click(object sender, RoutedEventArgs e)
        {
            var username = User_.Text.Trim();
            var password = Pass_.Password;
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Por favor, informe o usuário e a senha.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            var result = await Api.LoginAsync(username, password);
            if (result is null)
            {
                MessageBox.Show("Usuário ou senha inválidos.", "Aviso", MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
            new MainWindow(result.Username).Show();
            Close();
        }
    }
}
