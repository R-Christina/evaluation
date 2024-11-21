using EvaluationService.Data;
using EvaluationService.Models;
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

        [HttpGet("years/{userId}/{type}")]
        public IActionResult GetEvaluationsByYear(string userId, string type)
        {
            var evaluations = _context.Evaluations
                .Where(e =>
                    (e.EtatId == 2 || e.EtatId == 3) &&
                    e.UserEvaluations.Any(ue => ue.UserId == userId) &&
                    e.Type == type
                )
                .OrderByDescending(e => e.EvalAnnee)
                .Select(e => new { e.EvalAnnee, e.EvalId })
                .ToList();

            if (evaluations == null || !evaluations.Any())
            {
                return NotFound(new { message = "No archived evaluations found for the user." });
            }

            return Ok(evaluations);
        }


        // [HttpGet("historyCadre/{userId}/{evalId}/{phase}")]
        // public IActionResult GetEvaluationHistoryByPhase(string userId, int evalId, string phase)
        // {
        //     if (phase == "Fixation")
        //     {
        //         var fixationHistory = _context.HistoryCFos
        //             .Join(_context.UserEvaluations,
        //                   hcf => hcf.UserEvalId,
        //                   ue => ue.UserEvalId,
        //                   (hcf, ue) => new { hcf, ue })
        //             .Join(_context.Evaluations,
        //                   combined => combined.ue.EvalId,
        //                   e => e.EvalId,
        //                   (combined, e) => new { combined.hcf, combined.ue, e })
        //             .Where(result => result.ue.UserId == userId && result.e.EvalId == evalId && result.e.Type == "Cadre")
        //             .Select(result => new
        //             {
        //                 Phase = "Fixation",
        //                 HistoryId = result.hcf.HcfId,
        //                 result.hcf.PriorityName,
        //                 result.hcf.Description,
        //                 result.hcf.Weighting,
        //                 Date = result.hcf.CreatedAt,
        //                 EvaluationYear = result.e.EvalAnnee,
        //                 ResultIndicator = (string)null,
        //                 Result = (string)null
        //             })
        //             .ToList();

        //         if (fixationHistory == null || !fixationHistory.Any())
        //         {
        //             return NotFound(new { message = "No fixation history found for the specified user and evaluation." });
        //         }

        //         return Ok(fixationHistory);
        //     }
        //     else if (phase == "Mi-Parcours")
        //     {
        //         var miParcoursHistory = _context.HistoryCMps
        //             .Join(_context.UserEvaluations,
        //                   hcm => hcm.UserEvalId,
        //                   ue => ue.UserEvalId,
        //                   (hcm, ue) => new { hcm, ue })
        //             .Join(_context.Evaluations,
        //                   combined => combined.ue.EvalId,
        //                   e => e.EvalId,
        //                   (combined, e) => new { combined.hcm, combined.ue, e })
        //             .Where(result => result.ue.UserId == userId && result.e.EvalId == evalId && result.e.Type == "Cadre")
        //             .Select(result => new
        //             {
        //                 Phase = "Mi-Parcours",
        //                 HistoryId = result.hcm.HcmId,
        //                 result.hcm.PriorityName,
        //                 result.hcm.Description,
        //                 result.hcm.Weighting,
        //                 Date = result.hcm.UpdatedAt,
        //                 EvaluationYear = result.e.EvalAnnee,
        //                 result.hcm.ResultIndicator,
        //                 result.hcm.Result
        //             })
        //             .ToList();

        //         if (miParcoursHistory == null || !miParcoursHistory.Any())
        //         {
        //             return NotFound(new { message = "No mi-parcours history found for the specified user and evaluation." });
        //         }

        //         return Ok(miParcoursHistory);
        //     }
        //     else
        //     {
        //         return BadRequest(new { message = "Invalid phase specified. Please specify either 'Fixation' or 'Mi-Parcours'." });
        //     }
        // }

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
                        Result = (string)null,
                        ColumnValues = _context.HistoryObjectiveColumnValuesFos
                            .Where(hcv => hcv.HcfId == result.hcf.HcfId)
                            .Select(hcv => new
                            {
                                hcv.ColumnName,
                                hcv.Value
                            })
                            .ToList()
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
                        result.hcm.Result,
                        ColumnValues = _context.HistoryObjectiveColumnValuesMps
                            .Where(hcv => hcv.HcmId == result.hcm.HcmId)
                            .Select(hcv => new
                            {
                                hcv.ColumnName,
                                hcv.Value
                            })
                            .ToList()
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
                    TotalWeighting = Math.Truncate(g.Sum(h => h.Weighting) * 100) / 100


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
                    TotalWeighting = Math.Truncate(g.Sum(h => h.Weighting) * 100) / 100,
                    TotalResult = Math.Truncate(g.Sum(h => (h.Weighting * h.Result) / 100) * 100) / 100
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

        //------------------------------------------------------------------NonCadre---------------------------------------------------------------

        private List<IndicatorResultSum> CalculateIndicatorSums(List<IndicatorHistory> indicatorsHistory)
        {
            return indicatorsHistory
                .GroupBy(i => i.Name)
                .Select(g => new IndicatorResultSum
                {
                    Name = g.Key,
                    TotalResult = g.Sum(i => i.Result)
                })
                .ToList();
        }

        private Evaluation GetEvaluation(int evalId)
        {
            return _context.Evaluations.FirstOrDefault(e => e.EvalId == evalId);
        }

        // Méthode privée pour récupérer l'historique des compétences
        private List<object> GetCompetencesHistory(string userId, int evalId, string phase)
        {
            if (phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserCompetenceFOs
                    .Join(_context.UserEvaluations,
                        huc => huc.UserEvalId,
                        ue => ue.UserEvalId,
                        (huc, ue) => new { huc, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Fixation",
                        HistoryId = result.huc.HistoryUserCompetenceId,
                        result.huc.CompetenceName,
                        result.huc.Performance
                    })
                    .ToList<object>();
            }
            else if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserCompetenceMPs
                    .Join(_context.UserEvaluations,
                        huc => huc.UserEvalId,
                        ue => ue.UserEvalId,
                        (huc, ue) => new { huc, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Mi-Parcours",
                        HistoryId = result.huc.HistoryUserCompetenceId,
                        result.huc.CompetenceName,
                        result.huc.Performance
                    })
                    .ToList<object>();
            }
            else
            {
                return new List<object>();
            }
        }

        // Méthode privée pour récupérer l'historique des indicateurs
        private List<object> GetIndicatorsHistory(string userId, int evalId, string phase)
        {
            if (phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserIndicatorFOs
                    .Join(_context.UserEvaluations,
                        hui => hui.UserEvalId,
                        ue => ue.UserEvalId,
                        (hui, ue) => new { hui, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Fixation",
                        HistoryId = result.hui.HistoryUserIndicatorFOId,
                        result.hui.Name,
                        result.hui.ResultText,
                        result.hui.Result
                    })
                    .ToList<object>();
            }
            else if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserIndicatorMPs
                    .Join(_context.UserEvaluations,
                        hui => hui.UserEvalId,
                        ue => ue.UserEvalId,
                        (hui, ue) => new { hui, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Mi-Parcours",
                        HistoryId = result.hui.HistoryUserIndicatorMPId,
                        result.hui.Name,
                        result.hui.ResultText,
                        result.hui.Result
                    })
                    .ToList<object>();
            }
            else
            {
                return new List<object>();
            }
        }

        [HttpGet("historyNonCadre/{userId}/{evalId}/{phase}")]
        public IActionResult GetEvaluationHistoryByPhaseNonCadre(string userId, int evalId, string phase)
        {
            // Étape 1: Récupérer l'évaluation
            var evaluation = GetEvaluation(evalId);
            if (evaluation == null)
            {
                return NotFound(new { message = "Évaluation non trouvée." });
            }

            var evaluationYear = evaluation.EvalAnnee;

            // Étape 2: Récupérer l'historique des compétences et des indicateurs
            var competencesHistory = GetCompetencesHistory(userId, evalId, phase);
            var indicatorsHistory = GetIndicatorsHistory(userId, evalId, phase);

            // Calculer la moyenne des performances des compétences
            decimal competenceAvg = 0;
            if (competencesHistory.Any())
            {
                competenceAvg = competencesHistory.Average(c => Convert.ToDecimal(c.GetType().GetProperty("Performance").GetValue(c)));
            }

            // Vérifier si les deux listes sont vides
            if (!competencesHistory.Any() && !indicatorsHistory.Any())
            {
                return NotFound(new { message = $"Aucun historique de {phase} trouvé pour l'utilisateur, l'évaluation et la phase spécifiés." });
            }

            // Préparer la réponse de base
            if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
            {
                var indicatorsSum = indicatorsHistory
                    .GroupBy(i => i.GetType().GetProperty("Name").GetValue(i).ToString())
                    .Select(g => new
                    {
                        Name = g.Key,
                        TotalResult = g.Sum(i => Convert.ToDecimal(i.GetType().GetProperty("Result").GetValue(i)))
                    })
                    .ToList();

                decimal indicatorAvg = indicatorsSum.Any()
                    ? Math.Round(indicatorsSum.Average(g => g.TotalResult), 2)
                    : 0;

                var extendedResponse = new
                {
                    Phase = phase,
                    EvaluationYear = evaluationYear, // Inclusion unique de l'année d'évaluation
                    Competences = competencesHistory,
                    Indicators = indicatorsHistory,
                    IndicatorsSum = indicatorsSum,
                    CompetenceAvg = competenceAvg,
                    IndicatorAvg = indicatorAvg
                };

                return Ok(extendedResponse);
            }
            else
            {
                var baseResponse = new
                {
                    Phase = phase,
                    EvaluationYear = evaluationYear, // Inclusion unique de l'année d'évaluation
                    Competences = competencesHistory,
                    Indicators = indicatorsHistory,
                    CompetenceAvg = competenceAvg
                };

                return Ok(baseResponse);
            }
        }

        [HttpGet("calculateScore/{userId}/{evalId}/{phase}")]
        public IActionResult CalculateScore(string userId, int evalId, string phase)
        {
            // Étape 1: Récupérer l'évaluation
            var evaluation = GetEvaluation(evalId);
            if (evaluation == null)
            {
                return NotFound(new { message = "Évaluation non trouvée." });
            }

            // Récupérer les poids, en gérant les valeurs nulles
            decimal competenceWeightTotal = evaluation.CompetenceWeightTotal ?? 0;
            decimal indicatorWeightTotal = evaluation.IndicatorWeightTotal ?? 0;

            // Étape 2: Récupérer l'historique des compétences
            var competencesHistory = GetCompetencesHistory(userId, evalId, phase);

            // Calculer la moyenne des performances des compétences
            decimal competenceAvg = 0;
            if (competencesHistory.Any())
            {
                competenceAvg = competencesHistory.Average(c => Convert.ToDecimal(c.GetType().GetProperty("Performance").GetValue(c)));
            }

            // Déclaration de indicatorAvg comme nullable
            decimal? indicatorAvg = null;

            if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
            {
                var indicatorsHistory = GetIndicatorsHistory(userId, evalId, phase);

                var indicatorsSum = indicatorsHistory
                    .GroupBy(i => i.GetType().GetProperty("Name").GetValue(i).ToString())
                    .Select(g => new
                    {
                        Name = g.Key,
                        TotalResult = g.Sum(i => Convert.ToDecimal(i.GetType().GetProperty("Result").GetValue(i)))
                    })
                    .ToList();

                if (indicatorsSum.Any())
                {
                    indicatorAvg = Math.Round(indicatorsSum.Average(g => g.TotalResult), 2);
                }
            }

            // Calculer le score selon la formule
            // Si indicatorAvg est null, le score est défini à 0
            decimal score = indicatorAvg.HasValue
                ? (competenceAvg * competenceWeightTotal / 100) + (indicatorAvg.Value * indicatorWeightTotal / 100)
                : 0;

            // Préparer la réponse
            var response = new
            {
                Phase = phase,
                CompetenceAvg = competenceAvg,
                IndicatorAvg = indicatorAvg ?? 0, // Retourne 0 si indicatorAvg est null
                CompetenceWeightTotal = competenceWeightTotal,
                IndicatorWeightTotal = indicatorWeightTotal,
                Score = score
            };

            return Ok(response);
        }
    }

    public class IndicatorResultSum
    {
        public string Name { get; set; }
        public decimal TotalResult { get; set; }
    }

    public class IndicatorHistory
    {
        public string Phase { get; set; }
        public int HistoryId { get; set; }
        public string Name { get; set; }
        public string ResultText { get; set; }
        public decimal Result { get; set; }
        public int EvaluationYear { get; set; }
    }
}
