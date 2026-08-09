using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record ServicoCatalogoRequest(
        string Nome,
        string Categoria,
        string Descricao,
        decimal PrecoBase,
        string DuracaoEstimada);

    [ApiController]
    [Route("api/servicos")]
    public class ServicoCatalogoController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ServicoCatalogoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServicoCatalogo>>> GetAll()
        {
            var servicos = await _context.ServicosCatalogo
                .AsNoTracking()
                .OrderBy(servico => servico.Categoria)
                .ThenBy(servico => servico.Nome)
                .ToListAsync();

            return Ok(servicos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ServicoCatalogo>> GetById(int id)
        {
            var servico = await _context.ServicosCatalogo.FindAsync(id);
            if (servico is null) return NotFound("Serviço não encontrado.");

            return Ok(servico);
        }

        [HttpPost]
        public async Task<ActionResult<ServicoCatalogo>> Create([FromBody] ServicoCatalogoRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nome) ||
                string.IsNullOrWhiteSpace(req.Categoria) ||
                string.IsNullOrWhiteSpace(req.Descricao) ||
                string.IsNullOrWhiteSpace(req.DuracaoEstimada))
            {
                return BadRequest("Preencha nome, categoria, descrição e duração estimada.");
            }

            if (req.PrecoBase < 0)
                return BadRequest("Preço-base não pode ser negativo.");

            var servico = new ServicoCatalogo
            {
                Nome = req.Nome.Trim(),
                Categoria = req.Categoria.Trim(),
                Descricao = req.Descricao.Trim(),
                PrecoBase = req.PrecoBase,
                DuracaoEstimada = req.DuracaoEstimada.Trim(),
                CriadoEm = DateTime.UtcNow
            };

            _context.ServicosCatalogo.Add(servico);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = servico.Id }, servico);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var servico = await _context.ServicosCatalogo.FindAsync(id);
            if (servico is null) return NotFound("Serviço não encontrado.");

            _context.ServicosCatalogo.Remove(servico);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
