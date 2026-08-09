using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record OrcamentoRequest(
        int ClienteId,
        int TecnicoId,
        string Servicos,
        string Problema,
        string Diagnostico,
        string Prioridade,
        string Validade,
        string Observacoes,
        decimal ValorTotal);

    public record AtualizarStatusOrcamentoRequest(string Status);

    [ApiController]
    [Route("api/orcamentos")]
    public class OrcamentoController : ControllerBase
    {
        private static readonly string[] StatusPermitidos =
        [
            "pendente",
            "aprovado",
            "recusado"
        ];

        private readonly AppDbContext _context;

        public OrcamentoController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Orcamento>>> GetAll()
        {
            var orcamentos = await _context.Orcamentos
                .AsNoTracking()
                .Include(orcamento => orcamento.Cliente)
                .Include(orcamento => orcamento.Tecnico)
                .Include(orcamento => orcamento.OrdemServico)
                .OrderByDescending(orcamento => orcamento.Id)
                .ToListAsync();

            return Ok(orcamentos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Orcamento>> GetById(int id)
        {
            var orcamento = await _context.Orcamentos
                .AsNoTracking()
                .Include(item => item.Cliente)
                .Include(item => item.Tecnico)
                .Include(item => item.OrdemServico)
                .FirstOrDefaultAsync(item => item.Id == id);

            if (orcamento is null) return NotFound("Orçamento não encontrado.");
            return Ok(orcamento);
        }

        [HttpPost]
        public async Task<ActionResult<Orcamento>> Create([FromBody] OrcamentoRequest req)
        {
            if (req.ClienteId <= 0 || req.TecnicoId <= 0)
                return BadRequest("Cliente e técnico são obrigatórios.");

            if (string.IsNullOrWhiteSpace(req.Servicos) ||
                string.IsNullOrWhiteSpace(req.Problema) ||
                string.IsNullOrWhiteSpace(req.Diagnostico))
            {
                return BadRequest("Serviços, problema e diagnóstico são obrigatórios.");
            }

            if (req.ValorTotal < 0)
                return BadRequest("Valor total não pode ser negativo.");

            if (!DateTime.TryParseExact(req.Validade, "yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var validade))
            {
                return BadRequest("Formato de validade inválido. Use yyyy-MM-dd.");
            }

            var clienteExiste = await _context.Clientes.AnyAsync(cliente => cliente.Id == req.ClienteId);
            if (!clienteExiste) return NotFound("Cliente não encontrado.");

            var tecnicoExiste = await _context.Funcionários.AnyAsync(funcionario => funcionario.Id == req.TecnicoId);
            if (!tecnicoExiste) return NotFound("Técnico não encontrado.");

            var agora = DateTime.UtcNow;
            var orcamento = new Orcamento
            {
                ClienteId = req.ClienteId,
                TecnicoId = req.TecnicoId,
                Servicos = req.Servicos.Trim(),
                DescricaoProblema = req.Problema.Trim(),
                Diagnostico = req.Diagnostico.Trim(),
                Prioridade = string.IsNullOrWhiteSpace(req.Prioridade) ? "normal" : req.Prioridade.Trim(),
                Validade = DateTime.SpecifyKind(validade, DateTimeKind.Utc),
                Observacoes = req.Observacoes?.Trim() ?? "",
                ValorTotal = req.ValorTotal,
                Status = "pendente",
                CriadoEm = agora,
                AtualizadoEm = agora
            };

            _context.Orcamentos.Add(orcamento);
            await _context.SaveChangesAsync();

            orcamento.Numero = $"ORC-{orcamento.Id:00000}";
            await _context.SaveChangesAsync();

            var orcamentoCriado = await LoadOrcamento(orcamento.Id);
            return CreatedAtAction(nameof(GetById), new { id = orcamento.Id }, orcamentoCriado);
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<Orcamento>> AtualizarStatus(int id, [FromBody] AtualizarStatusOrcamentoRequest req)
        {
            if (!StatusPermitidos.Contains(req.Status))
                return BadRequest("Status inválido.");

            var orcamento = await _context.Orcamentos.FindAsync(id);
            if (orcamento is null) return NotFound("Orçamento não encontrado.");
            if (orcamento.Status == "convertido")
                return BadRequest("Orçamento convertido não pode ser alterado.");

            var agora = DateTime.UtcNow;
            orcamento.Status = req.Status;
            orcamento.AtualizadoEm = agora;
            orcamento.AprovadoEm = req.Status == "aprovado" ? agora : orcamento.AprovadoEm;
            orcamento.RecusadoEm = req.Status == "recusado" ? agora : orcamento.RecusadoEm;

            if (req.Status == "pendente")
            {
                orcamento.AprovadoEm = null;
                orcamento.RecusadoEm = null;
            }

            await _context.SaveChangesAsync();
            return Ok(await LoadOrcamento(id));
        }

        [HttpPost("{id}/converter")]
        public async Task<ActionResult<OrdemServico>> ConverterEmOrdemServico(int id)
        {
            var orcamento = await _context.Orcamentos.FindAsync(id);
            if (orcamento is null) return NotFound("Orçamento não encontrado.");
            if (orcamento.Status != "aprovado")
                return BadRequest("Apenas orçamentos aprovados podem virar ordem de serviço.");
            if (orcamento.OrdemServicoId.HasValue)
                return BadRequest("Este orçamento já foi convertido em ordem de serviço.");

            var agora = DateTime.UtcNow;
            var ordem = new OrdemServico
            {
                ClienteId = orcamento.ClienteId,
                TecnicoId = orcamento.TecnicoId,
                Servicos = orcamento.Servicos,
                DescricaoProblema = orcamento.DescricaoProblema,
                Diagnostico = orcamento.Diagnostico,
                Prioridade = orcamento.Prioridade,
                Prazo = orcamento.Validade,
                Observacoes = $"Convertida do orçamento {orcamento.Numero}. {orcamento.Observacoes}".Trim(),
                Status = "aberta",
                CriadaEm = agora,
                AtualizadaEm = agora
            };

            _context.OrdensServico.Add(ordem);
            await _context.SaveChangesAsync();

            ordem.NumeroSequencial = $"OS-{ordem.Id:00000}";
            ordem.Historico.Add(new HistoricoOrdemServico
            {
                Data = agora,
                Descricao = $"Ordem {ordem.NumeroSequencial} criada a partir do orçamento {orcamento.Numero}."
            });

            orcamento.Status = "convertido";
            orcamento.OrdemServicoId = ordem.Id;
            orcamento.ConvertidoEm = agora;
            orcamento.AtualizadoEm = agora;
            await _context.SaveChangesAsync();

            var ordemCriada = await _context.OrdensServico
                .AsNoTracking()
                .Include(item => item.Cliente)
                .Include(item => item.Tecnico)
                .Include(item => item.Historico.OrderBy(historico => historico.Data))
                .FirstAsync(item => item.Id == ordem.Id);

            return Ok(ordemCriada);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var orcamento = await _context.Orcamentos.FindAsync(id);
            if (orcamento is null) return NotFound("Orçamento não encontrado.");

            _context.Orcamentos.Remove(orcamento);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Task<Orcamento> LoadOrcamento(int id)
        {
            return _context.Orcamentos
                .AsNoTracking()
                .Include(item => item.Cliente)
                .Include(item => item.Tecnico)
                .Include(item => item.OrdemServico)
                .FirstAsync(item => item.Id == id);
        }
    }
}
