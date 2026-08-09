namespace Ordyvo_API.Models
{
    public class HistoricoOrdemServico
    {
        public int Id { get; set; }
        public int OrdemServicoId { get; set; }
        public OrdemServico OrdemServico { get; set; } = null!;
        public DateTime Data { get; set; } = DateTime.UtcNow;
        public string Descricao { get; set; } = "";
    }
}
