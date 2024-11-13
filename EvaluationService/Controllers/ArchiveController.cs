using EvaluationService.Data;
using Microsoft.AspNetCore.Mvc;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchiveController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public ArchiveController(AppdbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("annee/{userId}/{userType}")]
        public IActionResult GetArchivedEvaluations(string userId, string userType)
        {
            var evaluations = _context.Evaluations
                .Where(e => e.UserEvaluations.Any(u => u.UserId == userId) && e.EtatId == 2 && e.Type == userType)
                .OrderByDescending(e => e.EvalAnnee) // Order by year in descending order
                .Select(e => new { e.EvalAnnee, e.EvalId })
                .ToList();

            if (evaluations == null || !evaluations.Any())
            {
                return NotFound(new { message = "No archived evaluations found for the user." });
            }

            return Ok(evaluations);
        }
    }
}
