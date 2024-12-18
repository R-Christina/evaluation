using CommonModels.DTOs;
using EvaluationService.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("getScoreByPhase/{userId}/{phase}")]
        public IActionResult GetScoreByPhase(string userId, string phase)
        {
            if (phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase))
            {
                // Fixation phase for Cadre: weighting * 0 based on original code
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
                return BadRequest(new { message = "Invalid phase specified. Please specify either 'Fixation', 'Mi-Parcours', or 'Évaluation Finale'." });
            }
        }


        //---------------------------------------------------------------------------------NonCadre

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
            else if (phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                // Assuming you have a HistoryUserCompetenceFIs for the final phase
                return _context.HistoryUserCompetenceMPs
                    .Join(_context.UserEvaluations,
                        huc => huc.UserEvalId,
                        ue => ue.UserEvalId,
                        (huc, ue) => new { huc, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Évaluation Finale",
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
            else if (phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return _context.HistoryUserindicatorFis
                    .Join(_context.UserEvaluations,
                        hui => hui.UserEvalId,
                        ue => ue.UserEvalId,
                        (hui, ue) => new { hui, ue })
                    .Where(result => result.ue.UserId == userId && result.ue.EvalId == evalId)
                    .Select(result => new
                    {
                        Phase = "Évaluation Finale",
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
            if (!phase.Equals("Fixation", StringComparison.OrdinalIgnoreCase)
                && !phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase)
                && !phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Invalid phase. Use 'Fixation', 'Mi-Parcours', or 'Évaluation Finale'." });
            }

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
                var competencesHistory = GetCompetencesHistory(userId, evaluation.EvalId, phase);

                decimal competenceAvg = 0;
                if (competencesHistory.Any())
                {
                    competenceAvg = competencesHistory.Average(c => Convert.ToDecimal(c.GetType().GetProperty("Performance").GetValue(c)));
                }

                decimal? indicatorAvg = null;
                // Indicators are only relevant for Mi-Parcours or Évaluation Finale
                if (phase.Equals("Mi-Parcours", StringComparison.OrdinalIgnoreCase) || phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
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

                decimal competenceWeightTotal = evaluation.CompetenceWeightTotal ?? 0;
                decimal indicatorWeightTotal = evaluation.IndicatorWeightTotal ?? 0;

                decimal score = indicatorAvg.HasValue
                    ? Math.Round((competenceAvg * competenceWeightTotal / 100) + (indicatorAvg.Value * indicatorWeightTotal / 100), 2)
                    : 0;

                scoresByYear.Add(new
                {
                    EvaluationYear = evaluation.EvalAnnee,
                    Score = score
                });
            }

            return Ok(scoresByYear);
        }

        //---------------------------------------------------------------------------------Subordinates Score Comparison

        [HttpGet("subordinates/scoreComparison/{managerId}/{year}/{phase}")]
        public async Task<IActionResult> GetSubordinateScoreComparison(string managerId, int year, string phase)
        {
            // Only Évaluation Finale is supported here
            if (!phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only 'Évaluation Finale' phase is supported." });
            }

            try
            {
                var userServiceClient = _httpClientFactory.CreateClient("UserService");
                var requestUrl = $"api/User/user/subordonates?superiorId={managerId}";

                var subordinatesResponse = await userServiceClient.GetAsync(requestUrl);

                if (!subordinatesResponse.IsSuccessStatusCode)
                {
                    return StatusCode((int)subordinatesResponse.StatusCode, new { message = "Impossible de récupérer les subordonnés." });
                }

                var subordinates = await subordinatesResponse.Content.ReadFromJsonAsync<List<UserDTO>>();
                if (subordinates == null || !subordinates.Any())
                {
                    return NotFound(new { message = "Aucun subordonné trouvé pour ce manager." });
                }

                var results = new List<object>();

                foreach (var subordinate in subordinates)
                {
                    object scoreData = null;
                    bool isCadre = subordinate.TypeUser != null && subordinate.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase);

                    if (isCadre)
                    {
                        var cadreResult = GetScoreByPhase(subordinate.Id, phase);
                        if (cadreResult is OkObjectResult okCadreResult)
                        {
                            var cadreScores = okCadreResult.Value as IEnumerable<dynamic>;
                            if (cadreScores != null && cadreScores.Any())
                            {
                                var scoreEntry = cadreScores.FirstOrDefault(s => s.EvaluationYear == year);
                                if (scoreEntry != null)
                                {
                                    decimal score = scoreEntry.Score;
                                    scoreData = new
                                    {
                                        EvaluationYear = scoreEntry.EvaluationYear,
                                        Score = score
                                    };
                                }
                            }
                        }
                    }
                    else
                    {
                        var nonCadreResult = getFinaleScoreNonCadre(subordinate.Id, phase);
                        if (nonCadreResult is OkObjectResult okNonCadreResult)
                        {
                            var nonCadreScores = okNonCadreResult.Value as List<dynamic>;
                            if (nonCadreScores != null && nonCadreScores.Any())
                            {
                                var scoreEntry = nonCadreScores.FirstOrDefault(s => s.EvaluationYear == year);
                                if (scoreEntry != null)
                                {
                                    decimal score = scoreEntry.Score;
                                    scoreData = new
                                    {
                                        EvaluationYear = scoreEntry.EvaluationYear,
                                        Score = score
                                    };
                                }
                            }
                        }
                    }

                    results.Add(new
                    {
                        SubordinateId = subordinate.Id,
                        subordinate.Name,
                        subordinate.Matricule,
                        subordinate.Email,
                        ScoreData = scoreData
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Une erreur s'est produite : {ex.Message}");
                return StatusCode(500, new { message = "Une erreur interne est survenue." });
            }
        }

        [HttpGet("subordinates/averageScore/{managerId}/{year}/{phase}")]
        public async Task<IActionResult> GetSubordinatesAverageScore(string managerId, int year, string phase)
        {
            // Seule la phase "Évaluation Finale" est supportée ici
            if (!phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Seule la phase 'Évaluation Finale' est supportée." });
            }

            try
            {
                var userServiceClient = _httpClientFactory.CreateClient("UserService");
                var requestUrl = $"api/User/user/subordonates?superiorId={managerId}";

                var subordinatesResponse = await userServiceClient.GetAsync(requestUrl);

                if (!subordinatesResponse.IsSuccessStatusCode)
                {
                    return StatusCode((int)subordinatesResponse.StatusCode, new { message = "Impossible de récupérer les subordonnés." });
                }

                var subordinates = await subordinatesResponse.Content.ReadFromJsonAsync<List<UserDTO>>();
                if (subordinates == null || !subordinates.Any())
                {
                    return NotFound(new { message = "Aucun subordonné trouvé pour ce manager." });
                }

                var scores = new List<decimal>();

                foreach (var subordinate in subordinates)
                {
                    bool isCadre = subordinate.TypeUser != null && subordinate.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase);
                    decimal? score = null;

                    if (isCadre)
                    {
                        var cadreResult = GetScoreByPhase(subordinate.Id, phase);
                        if (cadreResult is OkObjectResult okCadreResult)
                        {
                            var cadreScores = okCadreResult.Value as IEnumerable<dynamic>;
                            if (cadreScores != null && cadreScores.Any())
                            {
                                var scoreEntry = cadreScores.FirstOrDefault(s => s.EvaluationYear == year);
                                if (scoreEntry != null)
                                {
                                    score = scoreEntry.Score;
                                }
                            }
                        }
                    }
                    else
                    {
                        var nonCadreResult = getFinaleScoreNonCadre(subordinate.Id, phase);
                        if (nonCadreResult is OkObjectResult okNonCadreResult)
                        {
                            var nonCadreScores = okNonCadreResult.Value as List<dynamic>;
                            if (nonCadreScores != null && nonCadreScores.Any())
                            {
                                var scoreEntry = nonCadreScores.FirstOrDefault(s => s.EvaluationYear == year);
                                if (scoreEntry != null)
                                {
                                    score = scoreEntry.Score;
                                }
                            }
                        }
                    }

                    if (score.HasValue)
                    {
                        scores.Add(score.Value);
                    }
                }

                if (!scores.Any())
                {
                    return NotFound(new { message = "Aucun score trouvé pour les subordonnés cette année." });
                }

                var averageScore = scores.Average();

                return Ok(new
                {
                    ManagerId = managerId,
                    Year = year,
                    Phase = phase,
                    AverageScore = averageScore,
                    TotalSubordinates = scores.Count
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Une erreur s'est produite : {ex.Message}");
                return StatusCode(500, new { message = "Une erreur interne est survenue." });
            }
        }

        [HttpGet("subordinates/averageScoresByYear/{managerId}/{phase}")]
        public async Task<IActionResult> GetSubordinatesAverageScoresByYear(string managerId, string phase)
        {
            // Seule la phase "Évaluation Finale" est supportée ici
            if (!phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Seule la phase 'Évaluation Finale' est supportée." });
            }

            try
            {
                var userServiceClient = _httpClientFactory.CreateClient("UserService");
                var requestUrl = $"api/User/user/subordonates?superiorId={managerId}";

                var subordinatesResponse = await userServiceClient.GetAsync(requestUrl);

                if (!subordinatesResponse.IsSuccessStatusCode)
                {
                    return StatusCode((int)subordinatesResponse.StatusCode, new { message = "Impossible de récupérer les subordonnés." });
                }

                var subordinates = await subordinatesResponse.Content.ReadFromJsonAsync<List<UserDTO>>();
                if (subordinates == null || !subordinates.Any())
                {
                    return NotFound(new { message = "Aucun subordonné trouvé pour ce manager." });
                }

                // Dictionnaire pour stocker les scores par année
                var scoresByYear = new Dictionary<int, List<decimal>>();

                foreach (var subordinate in subordinates)
                {
                    bool isCadre = subordinate.TypeUser != null && subordinate.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase);
                    List<dynamic> scoreEntries = null;

                    if (isCadre)
                    {
                        var cadreResult = GetScoreByPhase(subordinate.Id, phase);
                        if (cadreResult is OkObjectResult okCadreResult)
                        {
                            var cadreScores = okCadreResult.Value as IEnumerable<dynamic>;
                            if (cadreScores != null)
                            {
                                scoreEntries = cadreScores.ToList();
                            }
                        }
                    }
                    else
                    {
                        var nonCadreResult = getFinaleScoreNonCadre(subordinate.Id, phase);
                        if (nonCadreResult is OkObjectResult okNonCadreResult)
                        {
                            var nonCadreScores = okNonCadreResult.Value as List<dynamic>;
                            if (nonCadreScores != null)
                            {
                                scoreEntries = nonCadreScores;
                            }
                        }
                    }

                    if (scoreEntries != null)
                    {
                        foreach (var entry in scoreEntries)
                        {
                            int year = entry.EvaluationYear;
                            decimal score = entry.Score;

                            if (!scoresByYear.ContainsKey(year))
                            {
                                scoresByYear[year] = new List<decimal>();
                            }

                            scoresByYear[year].Add(score);
                        }
                    }
                }

                if (!scoresByYear.Any())
                {
                    return NotFound(new { message = "Aucun score trouvé pour les subordonnés." });
                }

                // Calculer le score moyen par année
                var averageScoresByYear = scoresByYear.Select(kvp => new
                {
                    Year = kvp.Key,
                    AverageScore = kvp.Value.Average(),
                    TotalSubordinates = kvp.Value.Count
                })
                .OrderByDescending(result => result.Year)  // Tri décroissant pour avoir les années les plus récentes en premier
                .ToList();

                return Ok(new
                {
                    ManagerId = managerId,
                    Phase = phase,
                    AverageScoresByYear = averageScoresByYear
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Une erreur s'est produite : {ex.Message}");
                return StatusCode(500, new { message = "Une erreur interne est survenue." });
            }
        }

        [HttpGet("averageScoresByYearForAll")]
        public async Task<IActionResult> GetAverageScoresByYearForAll()
        {
            var phase = "Évaluation Finale";

            // Récupération de tous les utilisateurs
            var userServiceClient = _httpClientFactory.CreateClient("UserService");
            var usersResponse = await userServiceClient.GetAsync("api/User/user");

            if (!usersResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)usersResponse.StatusCode, new { message = "Impossible de récupérer la liste des utilisateurs." });
            }

            var allUsers = await usersResponse.Content.ReadFromJsonAsync<List<UserDTO>>();
            if (allUsers == null || !allUsers.Any())
            {
                return NotFound(new { message = "Aucun utilisateur trouvé." });
            }

            // Séparer les utilisateurs par type
            var cadreUsers = allUsers
                .Where(u => u.TypeUser != null && u.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase))
                .Select(u => u.Id)
                .ToList();

            var nonCadreUsers = allUsers
                .Where(u => u.TypeUser == null || !u.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase))
                .Select(u => u.Id)
                .ToList();

            // Dictionnaires pour stocker les scores par année
            var cadreScoresByYear = new Dictionary<int, List<decimal>>();
            var nonCadreScoresByYear = new Dictionary<int, List<decimal>>();

            // Récupération des scores Cadres
            foreach (var cadreUserId in cadreUsers)
            {
                var result = GetScoreByPhase(cadreUserId, phase);
                if (result is OkObjectResult okCadreResult)
                {
                    var cadreScores = okCadreResult.Value as IEnumerable<dynamic>;
                    if (cadreScores != null)
                    {
                        foreach (var entry in cadreScores)
                        {
                            int year = entry.EvaluationYear;
                            decimal score = entry.Score;
                            if (!cadreScoresByYear.ContainsKey(year))
                            {
                                cadreScoresByYear[year] = new List<decimal>();
                            }
                            cadreScoresByYear[year].Add(score);
                        }
                    }
                }
            }

            // Récupération des scores Non Cadres
            foreach (var nonCadreUserId in nonCadreUsers)
            {
                var result = getFinaleScoreNonCadre(nonCadreUserId, phase);
                if (result is OkObjectResult okNonCadreResult)
                {
                    var nonCadreScores = okNonCadreResult.Value as List<dynamic>;
                    if (nonCadreScores != null)
                    {
                        foreach (var entry in nonCadreScores)
                        {
                            int year = entry.EvaluationYear;
                            decimal score = entry.Score;
                            if (!nonCadreScoresByYear.ContainsKey(year))
                            {
                                nonCadreScoresByYear[year] = new List<decimal>();
                            }
                            nonCadreScoresByYear[year].Add(score);
                        }
                    }
                }
            }

            // Calcul de la moyenne par année pour les Cadres
            var cadreAveragesByYear = cadreScoresByYear
                .Select(kvp => new
                {
                    Year = kvp.Key,
                    AverageScore = kvp.Value.Any() ? kvp.Value.Average() : 0,
                    TotalCadres = kvp.Value.Count
                })
                .OrderByDescending(r => r.Year)
                .ToList();

            // Calcul de la moyenne par année pour les Non Cadres
            var nonCadreAveragesByYear = nonCadreScoresByYear
                .Select(kvp => new
                {
                    Year = kvp.Key,
                    AverageScore = kvp.Value.Any() ? kvp.Value.Average() : 0,
                    TotalNonCadres = kvp.Value.Count
                })
                .OrderByDescending(r => r.Year)
                .ToList();

            return Ok(new
            {
                Phase = phase,
                CadreAveragesByYear = cadreAveragesByYear,
                NonCadreAveragesByYear = nonCadreAveragesByYear
            });
        }

        [HttpGet("averageScoresByYearAndDepartment/{phase}")]
        public async Task<IActionResult> GetAverageScoresByYearAndDepartment(string phase)
        {
            // Seule la phase "Évaluation Finale" est supportée ici
            if (!phase.Equals("Évaluation Finale", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Seule la phase 'Évaluation Finale' est supportée." });
            }

            try
            {
                // Récupérer tous les utilisateurs
                var userServiceClient = _httpClientFactory.CreateClient("UserService");
                var usersResponse = await userServiceClient.GetAsync("api/User/user");

                if (!usersResponse.IsSuccessStatusCode)
                {
                    return StatusCode((int)usersResponse.StatusCode, new { message = "Impossible de récupérer la liste des utilisateurs." });
                }

                var allUsers = await usersResponse.Content.ReadFromJsonAsync<List<UserDTO>>();
                if (allUsers == null || !allUsers.Any())
                {
                    return NotFound(new { message = "Aucun utilisateur trouvé." });
                }

                // Dictionnaire pour stocker les scores par année et département
                var scoresByYearAndDepartment = new Dictionary<int, Dictionary<string, List<decimal>>>();

                foreach (var user in allUsers)
                {
                    bool isCadre = user.TypeUser != null && user.TypeUser.Equals("Cadre", StringComparison.OrdinalIgnoreCase);
                    List<dynamic> scoreEntries = null;

                    // Récupérer les scores en fonction du type d'utilisateur
                    if (isCadre)
                    {
                        var cadreResult = GetScoreByPhase(user.Id, phase);
                        if (cadreResult is OkObjectResult okCadreResult)
                        {
                            var cadreScores = okCadreResult.Value as IEnumerable<dynamic>;
                            if (cadreScores != null)
                            {
                                scoreEntries = cadreScores.ToList();
                            }
                        }
                    }
                    else
                    {
                        var nonCadreResult = getFinaleScoreNonCadre(user.Id, phase);
                        if (nonCadreResult is OkObjectResult okNonCadreResult)
                        {
                            var nonCadreScores = okNonCadreResult.Value as List<dynamic>;
                            if (nonCadreScores != null)
                            {
                                scoreEntries = nonCadreScores;
                            }
                        }
                    }

                    // Si des scores sont présents, on les groupe par année et département
                    if (scoreEntries != null)
                    {
                        foreach (var entry in scoreEntries)
                        {
                            int entryYear = entry.EvaluationYear;
                            string department = user.Department ?? "Unknown";

                            // Initialiser le groupe pour l'année et le département s'il n'existe pas encore
                            if (!scoresByYearAndDepartment.ContainsKey(entryYear))
                            {
                                scoresByYearAndDepartment[entryYear] = new Dictionary<string, List<decimal>>();
                            }

                            if (!scoresByYearAndDepartment[entryYear].ContainsKey(department))
                            {
                                scoresByYearAndDepartment[entryYear][department] = new List<decimal>();
                            }

                            // Ajouter le score pour cette année et département
                            scoresByYearAndDepartment[entryYear][department].Add(entry.Score);
                        }
                    }
                }

                if (!scoresByYearAndDepartment.Any())
                {
                    return NotFound(new { message = "Aucun score trouvé pour les utilisateurs cette année." });
                }

                // Calculer la moyenne des scores par année et département
                var averageScoresByYearAndDepartment = scoresByYearAndDepartment.Select(yearKvp => new
                {
                    Year = yearKvp.Key,
                    Departments = yearKvp.Value.Select(departmentKvp => new
                    {
                        Department = departmentKvp.Key,
                        AverageScore = departmentKvp.Value.Average(),
                        TotalUsers = departmentKvp.Value.Count
                    }).ToList()
                })
                .OrderByDescending(result => result.Year)  // Tri décroissant par année
                .ToList();

                return Ok(new
                {
                    Phase = phase,
                    AverageScoresByYearAndDepartment = averageScoresByYearAndDepartment
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Une erreur s'est produite : {ex.Message}");
                return StatusCode(500, new { message = "Une erreur interne est survenue." });
            }
        }


    }
}

