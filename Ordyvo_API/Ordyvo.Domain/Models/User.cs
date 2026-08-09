using System.Data;

namespace Ordyvo_API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Usuario { get; set; } = "";
        public string Nome { get; set; } = "";
        public string Sobrenome { get; set; } = "";
        public string Senha { get; set; } = "";
        public bool AppStatus { get; set; } = true;
        public DateTime Data { get; set; } = DateTime.UtcNow;
    }
}
