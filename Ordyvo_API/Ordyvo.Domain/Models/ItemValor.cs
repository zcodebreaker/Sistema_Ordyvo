namespace Ordyvo_API.Models
{
    public class ItemValor
    {
        public int Id { get; set; }
        public int OrdemServicoId { get; set; }
        public OrdemServico OrdemServico { get; set; } = null!;
        public string ServicosExecutados { get; set; } = "";
        public string ProdutosPecas { get; set; } = "";
        public int Quantidade { get; set; } = 1;
        public decimal ValorServicos { get; set; }
        public decimal ValorProdutos { get; set; }
        public decimal MaoDeObra { get; set; }
        public decimal Desconto { get; set; }
        public decimal Impostos { get; set; }
        public decimal Total { get; set; }
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
