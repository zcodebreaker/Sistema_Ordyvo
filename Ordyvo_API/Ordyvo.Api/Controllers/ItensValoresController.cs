using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record ItemValorRequest(
        int OrdemServicoId,
        string ServicosExecutados,
        string ProdutosPecas,
        int Quantidade,
        decimal ValorServicos,
        decimal ValorProdutos,
        decimal MaoDeObra,
        decimal Desconto,
        decimal Impostos);

    [ApiController]
    [Route("api/itens-valores")]
    public class ItensValoresController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ItensValoresController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemValor>>> GetAll()
        {
            var itens = await _context.ItensValores
                .AsNoTracking()
                .Include(item => item.OrdemServico)
                    .ThenInclude(ordem => ordem.Cliente)
                .OrderByDescending(item => item.Id)
                .ToListAsync();

            return Ok(itens);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ItemValor>> GetById(int id)
        {
            var item = await _context.ItensValores
                .AsNoTracking()
                .Include(valor => valor.OrdemServico)
                    .ThenInclude(ordem => ordem.Cliente)
                .FirstOrDefaultAsync(valor => valor.Id == id);

            if (item is null) return NotFound("Item e valor não encontrado.");
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<ItemValor>> Create([FromBody] ItemValorRequest req)
        {
            if (req.OrdemServicoId <= 0)
                return BadRequest("Ordem de serviço é obrigatória.");

            if (string.IsNullOrWhiteSpace(req.ServicosExecutados) ||
                string.IsNullOrWhiteSpace(req.ProdutosPecas))
            {
                return BadRequest("Serviços executados e produtos/peças são obrigatórios.");
            }

            if (req.Quantidade <= 0)
                return BadRequest("Quantidade deve ser maior que zero.");

            if (req.ValorServicos < 0 || req.ValorProdutos < 0 || req.MaoDeObra < 0 ||
                req.Desconto < 0 || req.Impostos < 0)
            {
                return BadRequest("Valores monetários não podem ser negativos.");
            }

            var ordemExiste = await _context.OrdensServico
                .AnyAsync(ordem => ordem.Id == req.OrdemServicoId);

            if (!ordemExiste) return NotFound("Ordem de serviço não encontrada.");

            var total = req.ValorServicos + (req.ValorProdutos * req.Quantidade) +
                req.MaoDeObra + req.Impostos - req.Desconto;

            if (total < 0)
                return BadRequest("Total não pode ficar negativo.");

            var item = new ItemValor
            {
                OrdemServicoId = req.OrdemServicoId,
                ServicosExecutados = req.ServicosExecutados.Trim(),
                ProdutosPecas = req.ProdutosPecas.Trim(),
                Quantidade = req.Quantidade,
                ValorServicos = req.ValorServicos,
                ValorProdutos = req.ValorProdutos,
                MaoDeObra = req.MaoDeObra,
                Desconto = req.Desconto,
                Impostos = req.Impostos,
                Total = total,
                CriadoEm = DateTime.UtcNow
            };

            _context.ItensValores.Add(item);
            await _context.SaveChangesAsync();

            var itemCriado = await _context.ItensValores
                .AsNoTracking()
                .Include(valor => valor.OrdemServico)
                    .ThenInclude(ordem => ordem.Cliente)
                .FirstAsync(valor => valor.Id == item.Id);

            return CreatedAtAction(nameof(GetById), new { id = item.Id }, itemCriado);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var item = await _context.ItensValores.FindAsync(id);
            if (item is null) return NotFound("Item e valor não encontrado.");

            _context.ItensValores.Remove(item);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
