namespace Ordyvo_API.Models
{
    public class Orcamento
    {
        public int Id { get; set; }
        public string Numero { get; set; } = "";
        public int ClienteId { get; set; }
        public Clientes Cliente { get; set; } = null!;
        public int TecnicoId { get; set; }
        public Funcionários Tecnico { get; set; } = null!;
        public string Servicos { get; set; } = "";
        public string DescricaoProblema { get; set; } = "";
        public string Diagnostico { get; set; } = "";
        public string Prioridade { get; set; } = "normal";
        public DateTime Validade { get; set; }
        public string Observacoes { get; set; } = "";
        public decimal ValorTotal { get; set; }
        public string Status { get; set; } = "pendente";
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
        public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
        public DateTime? AprovadoEm { get; set; }
        public DateTime? RecusadoEm { get; set; }
        public DateTime? ConvertidoEm { get; set; }
        public int? OrdemServicoId { get; set; }
        public OrdemServico? OrdemServico { get; set; }
    }
}
