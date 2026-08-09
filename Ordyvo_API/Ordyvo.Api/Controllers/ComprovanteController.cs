using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record ComprovanteRequest(
        int OrdemServicoId,
        string Termos,
        string Observacoes,
        string AssinaturaCliente);

    [ApiController]
    [Route("api/comprovantes")]
    public class ComprovanteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComprovanteController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Comprovante>>> GetAll()
        {
            var comprovantes = await QueryComprovantes()
                .OrderByDescending(comprovante => comprovante.Id)
                .ToListAsync();

            return Ok(comprovantes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Comprovante>> GetById(int id)
        {
            var comprovante = await QueryComprovantes()
                .FirstOrDefaultAsync(item => item.Id == id);

            if (comprovante is null) return NotFound("Comprovante não encontrado.");
            return Ok(comprovante);
        }

        [HttpPost]
        public async Task<ActionResult<Comprovante>> Create([FromBody] ComprovanteRequest req)
        {
            if (req.OrdemServicoId <= 0)
                return BadRequest("Ordem de serviço é obrigatória.");

            if (string.IsNullOrWhiteSpace(req.Termos) ||
                string.IsNullOrWhiteSpace(req.AssinaturaCliente))
            {
                return BadRequest("Termos e assinatura do cliente são obrigatórios.");
            }

            var ordemExiste = await _context.OrdensServico
                .AnyAsync(ordem => ordem.Id == req.OrdemServicoId);

            if (!ordemExiste) return NotFound("Ordem de serviço não encontrada.");

            var comprovante = new Comprovante
            {
                OrdemServicoId = req.OrdemServicoId,
                Termos = req.Termos.Trim(),
                Observacoes = req.Observacoes?.Trim() ?? "",
                AssinaturaCliente = req.AssinaturaCliente.Trim(),
                CriadoEm = DateTime.UtcNow
            };

            _context.Comprovantes.Add(comprovante);
            await _context.SaveChangesAsync();

            comprovante.Numero = $"COMP-{comprovante.Id:00000}";
            await _context.SaveChangesAsync();

            var comprovanteCriado = await QueryComprovantes()
                .FirstAsync(item => item.Id == comprovante.Id);

            return CreatedAtAction(nameof(GetById), new { id = comprovante.Id }, comprovanteCriado);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var comprovante = await _context.Comprovantes.FindAsync(id);
            if (comprovante is null) return NotFound("Comprovante não encontrado.");

            _context.Comprovantes.Remove(comprovante);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private IQueryable<Comprovante> QueryComprovantes()
        {
            return _context.Comprovantes
                .AsNoTracking()
                .Include(comprovante => comprovante.OrdemServico)
                    .ThenInclude(ordem => ordem.Cliente)
                .Include(comprovante => comprovante.OrdemServico)
                    .ThenInclude(ordem => ordem.Tecnico)
                .Include(comprovante => comprovante.OrdemServico)
                    .ThenInclude(ordem => ordem.ItensValores);
        }
    }
}
