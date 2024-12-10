using EvaluationService.Data;
using Microsoft.AspNetCore.Mvc;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;

        public StatController(AppdbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        //---------------------------------------------------------------------------------Cadre

        // [HttpGet("getScoreByPhase/{userId}/{phase}")]
        // public IActionResult GetScoreByPhase(string userId, string phase)
        // {
        //     if (phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase))
        //     {
        //         // Retourner uniquement la pondération totale pour chaque année d'évaluation
        //         var fixationData = _context.HistoryCFos
        //             .Join(_context.UserEvaluations,
        //                 hcf => hcf.UserEvalId,
        //                 ue => ue.UserEvalId,
        //                 (hcf, ue) => new { hcf, ue })
        //             .Join(_context.Evaluations,
        //                 combined => combined.ue.EvalId,
        //                 e => e.EvalId,
        //                 (combined, e) => new { combined.hcf, combined.ue, e })
        //             .Where(result => result.ue.UserId == userId && result.e.Type == "Cadre")
        //             .GroupBy(result => result.e.EvalAnnee)
        //             .Select(group => new
        //             {
        //                 EvaluationYear = group.Key,
        //                 TotalWeighting = Math.Truncate(group.Sum(item => item.hcf.Weighting * 0) * 100) / 100
        //             })
        //             .ToList();

        //         if (!fixationData.Any())
        //         {
        //             return NotFound(new { message = "No fixation data found for the specified user." });
        //         }

        //         return Ok(fixationData);
        //     }
        //     else if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
        //     {
        //         // Calculer le score basé sur le résultat et la pondération
        //         var miParcoursScores = _context.HistoryCMps
        //             .Join(_context.UserEvaluations,
        //                 hcm => hcm.UserEvalId,
        //                 ue => ue.UserEvalId,
        //                 (hcm, ue) => new { hcm, ue })
        //             .Join(_context.Evaluations,
        //                 combined => combined.ue.EvalId,
        //                 e => e.EvalId,
        //                 (combined, e) => new { combined.hcm, combined.ue, e })
        //             .Where(result => result.ue.UserId == userId && result.e.Type == "Cadre")
        //             .GroupBy(result => result.e.EvalAnnee)
        //             .Select(group => new
        //             {
        //                 EvaluationYear = group.Key,
        //                 Score = Math.Truncate(group.Sum(item => (item.hcm.Weighting * item.hcm.Result) / 100) * 100) / 100
        //             })
        //             .ToList();

        //         if (!miParcoursScores.Any())
        //         {
        //             return NotFound(new { message = "No mi-parcours scores found for the specified user." });
        //         }

        //         return Ok(miParcoursScores);
        //     }
        //     else
        //     {
        //         return BadRequest(new { message = "Invalid phase specified. Please specify either 'Fixation' or 'Mi-Parcours'." });
        //     }
        // }

        [HttpGet("getScoreByPhase/{userId}/{phase}")]
        public IActionResult GetScoreByPhase(string userId, string phase)
        {
            if (phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase))
            {
                var fixationData = _context.HistoryCFos
                    .Join(_context.UserEvaluations,
                        hcf => hcf.UserEvalId,
                        ue => ue.UserEvalId,
                        (hcf, ue) => new { hcf, ue })
                    .Join(_context.Evaluations,
                        combined => combined.ue.EvalId,
                        e => e.EvalId,
                        (combined, e) => new { combined.hcf, combined.ue, e })
                    .Where(result => result.ue.UserId == userId && result.e.Type == "Cadre")
                    .GroupBy(result => result.e.EvalAnnee)
                    .Select(group => new
                    {
                        EvaluationYear = group.Key,
                        TotalWeighting = Math.Truncate(group.Sum(item => item.hcf.Weighting * 0) * 100) / 100
                    })
                    .ToList();

                if (!fixationData.Any())
                {
                    return NotFound(new { message = "No fixation data found for the specified user." });
                }

                return Ok(fixationData);
            }
            else if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase))
            {
                var miParcoursScores = _context.HistoryCMps
                    .Join(_context.UserEvaluations,
                        hcm => hcm.UserEvalId,
                        ue => ue.UserEvalId,
                        (hcm, ue) => new { hcm, ue })
                    .Join(_context.Evaluations,
                        combined => combined.ue.EvalId,
                        e => e.EvalId,
                        (combined, e) => new { combined.hcm, combined.ue, e })
                    .Where(result => result.ue.UserId == userId && result.e.Type == "Cadre")
                    .GroupBy(result => result.e.EvalAnnee)
                    .Select(group => new
                    {
                        EvaluationYear = group.Key,
                        Score = Math.Truncate(group.Sum(item => (item.hcm.Weighting * item.hcm.Result) / 100) * 100) / 100
                    })
                    .ToList();

                if (!miParcoursScores.Any())
                {
                    return NotFound(new { message = "No mi-parcours scores found for the specified user." });
                }

                return Ok(miParcoursScores);
            }
            else if (phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                var evaluationFinaleScores = _context.HistoryCFis
                    .Join(_context.UserEvaluations,
                        hcfi => hcfi.UserEvalId,
                        ue => ue.UserEvalId,
                        (hcfi, ue) => new { hcfi, ue })
                    .Join(_context.Evaluations,
                        combined => combined.ue.EvalId,
                        e => e.EvalId,
                        (combined, e) => new { combined.hcfi, combined.ue, e })
                    .Where(result => result.ue.UserId == userId && result.e.Type == "Cadre")
                    .GroupBy(result => result.e.EvalAnnee)
                    .Select(group => new
                    {
                        EvaluationYear = group.Key,
                        Score = Math.Truncate(group.Sum(item => (item.hcfi.Weighting * item.hcfi.Result) / 100) * 100) / 100
                    })
                    .ToList();

                if (!evaluationFinaleScores.Any())
                {
                    return NotFound(new { message = "No evaluation finale scores found for the specified user." });
                }

                return Ok(evaluationFinaleScores);
            }
            else
            {
                return BadRequest(new { message = "Invalid phase specified. Please specify either 'Fixation', 'Mi-Parcours', or 'Evaluation Finale'." });
            }
        }


        //---------------------------------------------------------------------------------NonCadre

        private List<object> GetCompetencesHistory(string userId, int evalId, string phase)
        {
            if (phase.Equals("Fixation Objectif", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserCompetenceFOs
                    .Join(_context.UserEvaluations,
                        huc => huc.UserEvalId,
                        ue => ue.UserEvalId,
                        (huc, ue) => new { huc, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Fixation Objectif",
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
            else if (phase.Equals("finale", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserCompetenceMPs
                    .Join(_context.UserEvaluations,
                        huc => huc.UserEvalId,
                        ue => ue.UserEvalId,
                        (huc, ue) => new { huc, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "finale",
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

        private List<object> GetIndicatorsHistory(string userId, int evalId, string phase)
        {
            if (phase.Equals("Fixation Objectif", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserIndicatorFOs
                    .Join(_context.UserEvaluations,
                        hui => hui.UserEvalId,
                        ue => ue.UserEvalId,
                        (hui, ue) => new { hui, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Fixation Objectif",
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
            else if (phase.Equals("Finale", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserindicatorFis
                    .Join(_context.UserEvaluations,
                        hui => hui.UserEvalId,
                        ue => ue.UserEvalId,
                        (hui, ue) => new { hui, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Finale",
                        HistoryId = result.hui.HistoryUserindicatorFiId,
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

        [HttpGet("getFinaleScoreNonCadre/{userId}/{phase}")]
        public IActionResult getFinaleScoreNonCadre(string userId, string phase)
        {
            // Récupérer toutes les évaluations de l'utilisateur
            var evaluations = _context.Evaluations
                .Join(_context.UserEvaluations,
                    e => e.EvalId,
                    ue => ue.EvalId,
                    (e, ue) => new { e, ue })
                .Where(combined => combined.ue.UserId == userId)
                .Select(combined => new
                {
                    combined.e.EvalId,
                    combined.e.EvalAnnee,
                    combined.e.CompetenceWeightTotal,
                    combined.e.IndicatorWeightTotal
                })
                .ToList();

            if (evaluations == null || !evaluations.Any())
            {
                return NotFound(new { message = "Aucune évaluation trouvée pour cet utilisateur." });
            }

            var scoresByYear = new List<object>();

            foreach (var evaluation in evaluations)
            {
                // Récupérer l'historique des compétences
                var competencesHistory = GetCompetencesHistory(userId, evaluation.EvalId, phase);

                // Calculer la moyenne des performances des compétences
                decimal competenceAvg = 0;
                if (competencesHistory.Any())
                {
                    competenceAvg = competencesHistory.Average(c => Convert.ToDecimal(c.GetType().GetProperty("Performance").GetValue(c)));
                }

                // Calculer la moyenne des indicateurs
                decimal? indicatorAvg = null;

                if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase) || phase.Equals("Finale", StringComparison.OrdinalIgnoreCase))
                {
                    var indicatorsHistory = GetIndicatorsHistory(userId, evaluation.EvalId, phase);

                    var indicatorsSum = indicatorsHistory
                        .GroupBy(i => i.GetType().GetProperty("Name").GetValue(i).ToString())
                        .Select(g => new
                        {
                            TotalResult = g.Sum(i => Convert.ToDecimal(i.GetType().GetProperty("Result").GetValue(i)))
                        })
                        .ToList();

                    if (indicatorsSum.Any())
                    {
                        indicatorAvg = Math.Round(indicatorsSum.Average(g => g.TotalResult), 2);
                    }
                }

                // Calculer le score
                decimal competenceWeightTotal = evaluation.CompetenceWeightTotal ?? 0;
                decimal indicatorWeightTotal = evaluation.IndicatorWeightTotal ?? 0;

                decimal score = indicatorAvg.HasValue
                    ? Math.Round((competenceAvg * competenceWeightTotal / 100) + (indicatorAvg.Value * indicatorWeightTotal / 100), 2)
                    : 0;

                // Ajouter le score pour l'année
                scoresByYear.Add(new
                {
                    EvaluationYear = evaluation.EvalAnnee,
                    Score = score
                });
            }

            return Ok(scoresByYear);
        }

    }
}