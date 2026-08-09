using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    public record FuncionarioRequest(string Nome, string Funcao, string DataEntrada);

    [ApiController]
    [Route("api/funcionario")]
    public class FuncionarioController : ControllerBase
    {
        private readonly AppDbContext _context;
        public FuncionarioController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Funcionários>>> GetAll()
        {
            var funcionarios = await _context.Funcionários.ToArrayAsync();
            return Ok(funcionarios);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Funcionários>> GetById(int id)
        {
            var funcionario = await _context.Funcionários.FindAsync(id);
            if (funcionario is null) return NotFound();
            return Ok(funcionario);
        }

        [HttpPost]
        public async Task<ActionResult<Funcionários>> Create([FromBody] FuncionarioRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Nome) || string.IsNullOrWhiteSpace(req.Funcao))
                return BadRequest("Nome e função são obrigatórios.");

            if (!DateTime.TryParseExact(req.DataEntrada, "yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var dataEntrada))
                return BadRequest("Formato de data inválido. Use yyyy-MM-dd.");

            var funcionario = new Funcionários
            {
                Nome = req.Nome,
                Função = req.Funcao,
                Data_Entrada = DateTime.SpecifyKind(dataEntrada, DateTimeKind.Utc)
            };

            _context.Funcionários.Add(funcionario);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new { id = funcionario.Id }, funcionario);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var funcionario = await _context.Funcionários.FindAsync(id);
            if (funcionario is null) return NotFound();
            _context.Funcionários.Remove(funcionario);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
