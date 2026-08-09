namespace Ordyvo_API.Models
{
    public class Comprovante
    {
        public int Id { get; set; }
        public string Numero { get; set; } = "";
        public int OrdemServicoId { get; set; }
        public OrdemServico OrdemServico { get; set; } = null!;
        public string Termos { get; set; } = "";
        public string Observacoes { get; set; } = "";
        public string AssinaturaCliente { get; set; } = "";
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
