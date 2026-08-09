using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Ordyvo_API.Controllers
{
    [ApiController]
    [Route("api/aparelho")]
    public class AparelhoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AparelhoController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Aparelhos>>> GetAll()
        {
            var aparelhos = await _context.Aparelhos.Include(a => a.Clientes).ToListAsync();
            return Ok(aparelhos);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<Aparelhos>> GetById(int id)
        {
            var aparelho = await _context.Aparelhos.Include(a => a.Clientes).FirstOrDefaultAsync(a => a.Id == id);
            if (aparelho == null)
                return NotFound("Aparelho não encontrado.");
            return Ok(aparelho);
        }
        [HttpPost]
        public async Task<ActionResult<Aparelhos>> Create(Aparelhos aparelho)
        {
            if (string.IsNullOrWhiteSpace(aparelho.Marca) || string.IsNullOrWhiteSpace(aparelho.Aparelho) || string.IsNullOrWhiteSpace(aparelho.Defeito))
            {
                return BadRequest("Por favor, preencha todos os campos obrigatórios.");
            }
            if (aparelho.Clientes == null || aparelho.Clientes.Id <= 0)
                return BadRequest("Cliente inválido.");
            var clienteExistente = await _context.Clientes.FindAsync(aparelho.Clientes.Id);
            if (clienteExistente == null)
                return NotFound("Cliente não encontrado.");
            aparelho.Clientes = clienteExistente;
            _context.Aparelhos.Add(aparelho);
            await _context.SaveChangesAsync();
            return Ok(new
            {aparelho.Id, aparelho.Marca, aparelho.Aparelho, aparelho.Defeito});
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Aparelhos aparelhoAtualizado)
        {
            if (id != aparelhoAtualizado.Id)
                return BadRequest("ID da rota diferente do ID enviado no corpo.");
            if (string.IsNullOrWhiteSpace(aparelhoAtualizado.Marca) || string.IsNullOrWhiteSpace(aparelhoAtualizado.Aparelho) || string.IsNullOrWhiteSpace(aparelhoAtualizado.Defeito))
            {
                return BadRequest("Por favor, preencha todos os campos obrigatórios.");
            }
            var aparelhoExistente = await _context.Aparelhos.Include(a => a.Clientes).FirstOrDefaultAsync(a => a.Id == id);
            if (aparelhoExistente == null)
                return NotFound("Aparelho não encontrado.");
            aparelhoExistente.Marca = aparelhoAtualizado.Marca;
            aparelhoExistente.Aparelho = aparelhoAtualizado.Aparelho;
            aparelhoExistente.Defeito = aparelhoAtualizado.Defeito;
            if (aparelhoAtualizado.Clientes != null && aparelhoAtualizado.Clientes.Id > 0)
            {
                var clienteExistente = await _context.Clientes.FindAsync(aparelhoAtualizado.Clientes.Id);
                if (clienteExistente == null)
                    return NotFound("Cliente não encontrado.");
                aparelhoExistente.Clientes = clienteExistente;
            }
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var aparelho = await _context.Aparelhos.FindAsync(id);
            if (aparelho == null)
                return NotFound("Aparelho não encontrado.");
            _context.Aparelhos.Remove(aparelho);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("client/{clienteId}")]
        public async Task<ActionResult<List<Aparelhos>>> GetByClienteId(int clienteId)
        {
            var aparelhos = await _context.Aparelhos
                .Include(a => a.Clientes)
                .Where(a => a.Clientes.Id == clienteId)
                .ToListAsync();
            if (aparelhos == null || !aparelhos.Any())
                return NotFound("Nenhum aparelho encontrado para este cliente.");
            return Ok(aparelhos);
        }
    }
}
