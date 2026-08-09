using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ordyvo_API.Data;

namespace Ordyvo_API.Controllers
{
    [ApiController]
    [Route("api/db")]
    public class DBController : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult>Get([FromServices]
        AppDbContext db)
        {
            var ok = await db.Database.CanConnectAsync();
            if(ok)
                return Ok(new { status = "DATABASE_ONLINE" });
            return
            StatusCode(503, new { status = "DATABASE_OFFLINE" });
        }       
    }
}