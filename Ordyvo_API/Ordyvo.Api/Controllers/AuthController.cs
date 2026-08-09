using Ordyvo_API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BCrypt.Net;

namespace Ordyvo_API.Controllers
{
    public record LoginRequest(string Username, string Password);
    public record RegisterRequest(string Username, string Nome, string Sobrenome, string Password);

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req, [FromServices] AppDbContext db)
        {
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Usuario == req.Username && u.AppStatus);
            if (user is null) return Unauthorized(new { message = "Usuário ou senha inválidos" });

            var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.Senha);

            if (!ok) return Unauthorized(new { message = "Usuário ou senha inválidos" });

            return Ok(new { userId = user.Id, username = user.Usuario, nome = user.Nome, sobrenome = user.Sobrenome });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest req, [FromServices] AppDbContext db)
        {
            if (string.IsNullOrWhiteSpace(req.Username) ||
                string.IsNullOrWhiteSpace(req.Nome) ||
                string.IsNullOrWhiteSpace(req.Sobrenome) ||
                string.IsNullOrWhiteSpace(req.Password))
            {
                return BadRequest(new { message = "Usuário, nome, sobrenome e senha são obrigatórios." });
            }

            var username = req.Username.Trim();
            var existe = await db.Users.AnyAsync(u => u.Usuario == username);
            if (existe) return Conflict(new { message = "Usuário já está em uso." });

            var novoUser = new Ordyvo_API.Models.User
            {
                Usuario = username,
                Nome = req.Nome.Trim(),
                Sobrenome = req.Sobrenome.Trim(),
                Senha = BCrypt.Net.BCrypt.HashPassword(req.Password),
                AppStatus = true,
                Data = DateTime.UtcNow
            };

            db.Users.Add(novoUser);
            await db.SaveChangesAsync();
            return Ok(new { userId = novoUser.Id, username = novoUser.Usuario, nome = novoUser.Nome, sobrenome = novoUser.Sobrenome });
        }
    }
}
