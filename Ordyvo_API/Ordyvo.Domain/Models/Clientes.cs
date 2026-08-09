namespace Ordyvo_API.Models
{
    public class Clientes
    {
        public int Id { get; set; }
        public string Cliente { get; set; } = "";
        public string Endereço { get; set; } = "";
        public int Numero { get; set; }
        public string Bairro { get; set; } = "";
        public List<Aparelhos> Aparelhos { get; set; } = new();
    }
}
