using EvaluationService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("years/{userId}")]
        public IActionResult GetEvaluationsByYear(string userId)
        {
            var evaluations = _context.Evaluations
                .Where(e => e.UserEvaluations.Any(ue => ue.UserId == userId) && e.EtatId == 2 || e.EtatId == 3)
                .OrderByDescending(e => e.EvalAnnee)
                .Select(e => new { e.EvalAnnee, e.EvalId })
                .ToList();

            if (evaluations == null || !evaluations.Any())
            {
                return NotFound(new { message = "No archived evaluations found for the user." });
            }

            return Ok(evaluations);
        }

        [HttpGet("historyCadre/{userId}/{evalId}/{phase}")]
        public IActionResult GetEvaluationHistoryByPhase(string userId, int evalId, string phase)
        {
            if (phase == "Fixation")
            {
                var fixationHistory = _context.HistoryCFos
                    .Join(_context.UserEvaluations,
                          hcf => hcf.UserEvalId,
                          ue => ue.UserEvalId,
                          (hcf, ue) => new { hcf, ue })
                    .Join(_context.Evaluations,
                          combined => combined.ue.EvalId,
                          e => e.EvalId,
                          (combined, e) => new { combined.hcf, combined.ue, e })
                    .Where(result => result.ue.UserId == userId && result.e.EvalId == evalId && result.e.Type == "Cadre")
                    .Select(result => new
                    {
                        Phase = "Fixation",
                        HistoryId = result.hcf.HcfId,
                        result.hcf.PriorityName,
                        result.hcf.Description,
                        result.hcf.Weighting,
                        Date = result.hcf.CreatedAt,
                        EvaluationYear = result.e.EvalAnnee,
                        ResultIndicator = (string)null,
                        Result = (string)null
                    })
                    .ToList();

                if (fixationHistory == null || !fixationHistory.Any())
                {
                    return NotFound(new { message = "No fixation history found for the specified user and evaluation." });
                }

                return Ok(fixationHistory);
            }
            else if (phase == "Mi-Parcours")
            {
                var miParcoursHistory = _context.HistoryCMps
                    .Join(_context.UserEvaluations,
                          hcm => hcm.UserEvalId,
                          ue => ue.UserEvalId,
                          (hcm, ue) => new { hcm, ue })
                    .Join(_context.Evaluations,
                          combined => combined.ue.EvalId,
                          e => e.EvalId,
                          (combined, e) => new { combined.hcm, combined.ue, e })
                    .Where(result => result.ue.UserId == userId && result.e.EvalId == evalId && result.e.Type == "Cadre")
                    .Select(result => new
                    {
                        Phase = "Mi-Parcours",
                        HistoryId = result.hcm.HcmId,
                        result.hcm.PriorityName,
                        result.hcm.Description,
                        result.hcm.Weighting,
                        Date = result.hcm.UpdatedAt,
                        EvaluationYear = result.e.EvalAnnee,
                        result.hcm.ResultIndicator,
                        result.hcm.Result
                    })
                    .ToList();

                if (miParcoursHistory == null || !miParcoursHistory.Any())
                {
                    return NotFound(new { message = "No mi-parcours history found for the specified user and evaluation." });
                }

                return Ok(miParcoursHistory);
            }
            else
            {
                return BadRequest(new { message = "Invalid phase specified. Please specify either 'Fixation' or 'Mi-Parcours'." });
            }
        }
        
        private async Task<int?> GetUserEvalIdAsync(int evalId, string userId)
        {
            var userEvaluation = await _context.UserEvaluations
                .FirstOrDefaultAsync(ue => ue.EvalId == evalId && ue.UserId == userId);

            return userEvaluation?.UserEvalId;
        }

        [HttpGet("priority/totalWeighting/{evalId}/{userId}")]
        public async Task<IActionResult> GetTotalWeightingByPriority(int evalId, string userId)
        {
            var userEvalId = await GetUserEvalIdAsync(evalId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { message = "User evaluation not found." });
            }

            var totalWeightings = _context.HistoryCFos
                .Where(h => h.UserEvalId == userEvalId)
                .GroupBy(h => h.PriorityName)
                .Select(g => new
                {
                    PriorityName = g.Key,
                    TotalWeighting = (int)Math.Round(g.Sum(h => h.Weighting))
                })
                .ToList();

            if (totalWeightings == null || !totalWeightings.Any())
            {
                return NotFound(new { message = "No data found for the specified priorities." });
            }

            var totalWeightingSum = totalWeightings.Sum(g => g.TotalWeighting);

            return Ok(new
            {
                TotalWeightings = totalWeightings,
                TotalWeightingSum = totalWeightingSum
            });
        }

        [HttpGet("priority/totalWeightingAndResult/{evalId}/{userId}")]
        public async Task<IActionResult> GetTotalWeightingAndResultByPriority(int evalId, string userId)
        {
            var userEvalId = await GetUserEvalIdAsync(evalId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { message = "User evaluation not found." });
            }

            var totalWeightingAndResults = _context.HistoryCMps
                .Where(h => h.UserEvalId == userEvalId)
                .GroupBy(h => h.PriorityName)
                .Select(g => new
                {
                    PriorityName = g.Key,
                    TotalWeighting = (int)Math.Round(g.Sum(h => h.Weighting)),
                    TotalResult = (int)Math.Round(g.Sum(h => (h.Weighting * h.Result) / 100))
                })
                .ToList();

            if (totalWeightingAndResults == null || !totalWeightingAndResults.Any())
            {
                return NotFound(new { message = "No data found for the specified priorities." });
            }

            var totalWeightingSum = totalWeightingAndResults.Sum(g => g.TotalWeighting);
            var totalResultSum = totalWeightingAndResults.Sum(g => g.TotalResult);

            return Ok(new
            {
                TotalWeightingAndResults = totalWeightingAndResults,
                TotalWeightingSum = totalWeightingSum,
                TotalResultSum = totalResultSum
            });
        }

        
    }
}
