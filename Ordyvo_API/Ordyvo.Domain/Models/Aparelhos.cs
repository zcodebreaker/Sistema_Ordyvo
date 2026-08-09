namespace Ordyvo_API.Models
{
    public class Aparelhos
    {
        public int Id { get; set; }
        public string Marca { get; set; } = "";
        public string Aparelho { get; set; } = "";
        public string Defeito { get; set; } = "";
        public Clientes Clientes { get; set; } = null!;
    }
}
