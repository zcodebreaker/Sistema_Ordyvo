namespace Ordyvo_API.Models
{
    public class ServicoCatalogo
    {
        public int Id { get; set; }
        public string Nome { get; set; } = "";
        public string Categoria { get; set; } = "";
        public string Descricao { get; set; } = "";
        public decimal PrecoBase { get; set; }
        public string DuracaoEstimada { get; set; } = "";
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
