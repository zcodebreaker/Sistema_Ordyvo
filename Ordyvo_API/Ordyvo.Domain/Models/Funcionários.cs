namespace Ordyvo_API.Models
{
    public class Funcionários
    {
        public int Id { get; set; }
        public string Nome { get; set; } = "";
        public string Função { get; set; } = "";
        public DateTime Data_Entrada { get; set; } = DateTime.UtcNow;
    }
}
