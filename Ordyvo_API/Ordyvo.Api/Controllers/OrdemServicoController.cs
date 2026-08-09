using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record OrdemServicoRequest(
        int ClienteId,
        int TecnicoId,
        string Servicos,
        string Problema,
        string Diagnostico,
        string Prioridade,
        string Prazo,
        string Observacoes,
        string Status);

    public record AtualizarStatusRequest(string Status);

    [ApiController]
    [Route("api/ordens-servico")]
    public class OrdemServicoController : ControllerBase
    {
        private static readonly string[] StatusPermitidos =
        [
            "aberta",
            "em análise",
            "aguardando aprovação",
            "em execução",
            "concluída",
            "cancelada"
        ];

        private readonly AppDbContext _context;

        public OrdemServicoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrdemServico>>> GetAll()
        {
            var ordens = await _context.OrdensServico
                .AsNoTracking()
                .Include(ordem => ordem.Cliente)
                .Include(ordem => ordem.Tecnico)
                .Include(ordem => ordem.Historico.OrderBy(historico => historico.Data))
                .OrderByDescending(ordem => ordem.Id)
                .ToListAsync();

            return Ok(ordens);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<OrdemServico>> GetById(int id)
        {
            var ordem = await _context.OrdensServico
                .AsNoTracking()
                .Include(item => item.Cliente)
                .Include(item => item.Tecnico)
                .Include(item => item.Historico.OrderBy(historico => historico.Data))
                .FirstOrDefaultAsync(item => item.Id == id);

            if (ordem is null) return NotFound("Ordem de serviço não encontrada.");
            return Ok(ordem);
        }

        [HttpPost]
        public async Task<ActionResult<OrdemServico>> Create([FromBody] OrdemServicoRequest req)
        {
            if (req.ClienteId <= 0 || req.TecnicoId <= 0)
                return BadRequest("Cliente e técnico são obrigatórios.");

            if (string.IsNullOrWhiteSpace(req.Servicos) ||
                string.IsNullOrWhiteSpace(req.Problema) ||
                string.IsNullOrWhiteSpace(req.Diagnostico))
            {
                return BadRequest("Serviços, problema e diagnóstico são obrigatórios.");
            }

            if (!StatusPermitidos.Contains(req.Status))
                return BadRequest("Status inválido.");

            if (!DateTime.TryParseExact(req.Prazo, "yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var prazo))
            {
                return BadRequest("Formato de prazo inválido. Use yyyy-MM-dd.");
            }

            var clienteExiste = await _context.Clientes.AnyAsync(cliente => cliente.Id == req.ClienteId);
            if (!clienteExiste) return NotFound("Cliente não encontrado.");

            var tecnicoExiste = await _context.Funcionários.AnyAsync(funcionario => funcionario.Id == req.TecnicoId);
            if (!tecnicoExiste) return NotFound("Técnico não encontrado.");

            var agora = DateTime.UtcNow;
            var ordem = new OrdemServico
            {
                ClienteId = req.ClienteId,
                TecnicoId = req.TecnicoId,
                Servicos = req.Servicos.Trim(),
                DescricaoProblema = req.Problema.Trim(),
                Diagnostico = req.Diagnostico.Trim(),
                Prioridade = string.IsNullOrWhiteSpace(req.Prioridade) ? "normal" : req.Prioridade.Trim(),
                Prazo = DateTime.SpecifyKind(prazo, DateTimeKind.Utc),
                Observacoes = req.Observacoes?.Trim() ?? "",
                Status = req.Status,
                CriadaEm = agora,
                AtualizadaEm = agora
            };

            _context.OrdensServico.Add(ordem);
            await _context.SaveChangesAsync();

            ordem.NumeroSequencial = $"OS-{ordem.Id:00000}";
            ordem.Historico.Add(new HistoricoOrdemServico
            {
                Data = agora,
                Descricao = $"Ordem {ordem.NumeroSequencial} criada com status \"{ordem.Status}\"."
            });
            await _context.SaveChangesAsync();

            var ordemCriada = await _context.OrdensServico
                .AsNoTracking()
                .Include(item => item.Cliente)
                .Include(item => item.Tecnico)
                .Include(item => item.Historico.OrderBy(historico => historico.Data))
                .FirstAsync(item => item.Id == ordem.Id);

            return CreatedAtAction(nameof(GetById), new { id = ordem.Id }, ordemCriada);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> AtualizarStatus(int id, [FromBody] AtualizarStatusRequest req)
        {
            if (!StatusPermitidos.Contains(req.Status))
                return BadRequest("Status inválido.");

            var ordem = await _context.OrdensServico
                .Include(item => item.Historico)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (ordem is null) return NotFound("Ordem de serviço não encontrada.");
            if (ordem.Status == req.Status) return NoContent();

            var statusAnterior = ordem.Status;
            ordem.Status = req.Status;
            ordem.AtualizadaEm = DateTime.UtcNow;
            ordem.Historico.Add(new HistoricoOrdemServico
            {
                Data = ordem.AtualizadaEm,
                Descricao = $"Status alterado de \"{statusAnterior}\" para \"{ordem.Status}\"."
            });

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var ordem = await _context.OrdensServico.FindAsync(id);
            if (ordem is null) return NotFound("Ordem de serviço não encontrada.");

            _context.OrdensServico.Remove(ordem);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
