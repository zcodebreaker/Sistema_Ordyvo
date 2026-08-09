using Microsoft.EntityFrameworkCore;
using Ordyvo_API.Models;

namespace Ordyvo_API.Data

{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {

        }
        public DbSet<User>Users{ get; set; }
        public DbSet<Clientes>Clientes{ get; set; }
        public DbSet<Aparelhos>Aparelhos{ get; set; }
        public DbSet<Funcionários> Funcionários{ get; set; }
        public DbSet<ServicoCatalogo> ServicosCatalogo { get; set; }
        public DbSet<OrdemServico> OrdensServico { get; set; }
        public DbSet<HistoricoOrdemServico> HistoricosOrdensServico { get; set; }
        public DbSet<ItemValor> ItensValores { get; set; }
        public DbSet<Orcamento> Orcamentos { get; set; }
        public DbSet<Comprovante> Comprovantes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<ServicoCatalogo>()
                .Property(servico => servico.PrecoBase)
                .HasPrecision(12, 2);

            modelBuilder.Entity<OrdemServico>()
                .HasMany(ordem => ordem.Historico)
                .WithOne(historico => historico.OrdemServico)
                .HasForeignKey(historico => historico.OrdemServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrdemServico>()
                .HasMany(ordem => ordem.ItensValores)
                .WithOne(item => item.OrdemServico)
                .HasForeignKey(item => item.OrdemServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrdemServico>()
                .HasMany(ordem => ordem.Comprovantes)
                .WithOne(comprovante => comprovante.OrdemServico)
                .HasForeignKey(comprovante => comprovante.OrdemServicoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.ValorServicos)
                .HasPrecision(12, 2);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.ValorProdutos)
                .HasPrecision(12, 2);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.MaoDeObra)
                .HasPrecision(12, 2);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.Desconto)
                .HasPrecision(12, 2);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.Impostos)
                .HasPrecision(12, 2);

            modelBuilder.Entity<ItemValor>()
                .Property(item => item.Total)
                .HasPrecision(12, 2);

            modelBuilder.Entity<Orcamento>()
                .Property(orcamento => orcamento.ValorTotal)
                .HasPrecision(12, 2);

            modelBuilder.Entity<Orcamento>()
                .HasOne(orcamento => orcamento.OrdemServico)
                .WithMany()
                .HasForeignKey(orcamento => orcamento.OrdemServicoId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
