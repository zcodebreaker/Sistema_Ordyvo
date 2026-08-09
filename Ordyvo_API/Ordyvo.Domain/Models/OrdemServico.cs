namespace Ordyvo_API.Models
{
    public class OrdemServico
    {
        public int Id { get; set; }
        public string NumeroSequencial { get; set; } = "";
        public int ClienteId { get; set; }
        public Clientes Cliente { get; set; } = null!;
        public int TecnicoId { get; set; }
        public Funcionários Tecnico { get; set; } = null!;
        public string Servicos { get; set; } = "";
        public string DescricaoProblema { get; set; } = "";
        public string Diagnostico { get; set; } = "";
        public string Prioridade { get; set; } = "normal";
        public DateTime Prazo { get; set; }
        public string Observacoes { get; set; } = "";
        public string Status { get; set; } = "aberta";
        public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
        public DateTime AtualizadaEm { get; set; } = DateTime.UtcNow;
        public List<HistoricoOrdemServico> Historico { get; set; } = new();
        public List<ItemValor> ItensValores { get; set; } = new();
        public List<Comprovante> Comprovantes { get; set; } = new();
    }
}
