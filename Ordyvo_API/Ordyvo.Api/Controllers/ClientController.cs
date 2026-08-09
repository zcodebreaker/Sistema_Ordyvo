using Ordyvo_API.Data;
using Ordyvo_API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace Ordyvo_API.Controllers
{
    [ApiController]
    [Route("api/client")]
    public class ClientController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ClientController(AppDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Clientes>>>GetAll()
        {
            var clientes = await _context.Clientes.ToArrayAsync();
            return Ok(clientes);
        }
        [HttpGet("{Id}")]
        public async Task<ActionResult<Clientes>>GetById(int id)
        {
            var clientes = await _context.Clientes.FindAsync(id);
            if (clientes is null) return NotFound();
            return Ok(clientes);
        }
        [HttpPost]
        public async Task<ActionResult<Clientes>>Create(Clientes clientes)
        {
            if(string.IsNullOrWhiteSpace(clientes.Cliente) || (string.IsNullOrWhiteSpace(clientes.Endereço) || (string.IsNullOrWhiteSpace(clientes.Bairro))))
            {
                return BadRequest("Por favor, preencha todos os campos.");
            }
            _context.Clientes.Add(clientes);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetById), new {id = clientes.Id}, clientes);
        }
        [HttpPut("{Id}")]
        public async Task<IActionResult>Update(int id, Clientes clientes)
        {
            if (id != clientes.Id)
                return BadRequest();
            _context.Entry(clientes).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpDelete("{Id}")]
        public async Task<IActionResult>Delete(int id)
        {
            var clientes = await _context.Clientes.FindAsync(id);
            if (clientes == null)
                return NotFound();
            _context.Clientes.Remove(clientes);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
