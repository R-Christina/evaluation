using EvaluationService.Data;
using EvaluationService.DTOs;
using EvaluationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;

        public EvaluationController(AppdbContext context, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
        }

        [HttpGet("{evalId}")]
        public async Task<ActionResult<Evaluation>> GetEvaluationById(int evalId)
        {
            var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);
            if (evaluation == null)
            {
                return NotFound(new { Message = "Évaluation non trouvée." });
            }
            return Ok(evaluation);
        }

        private async Task<List<UserDto>> GetUsersByTypeAsync(string type)
        {
            var client = _httpClientFactory.CreateClient("UserService");
            var response = await client.GetAsync($"api/User/users-with-type?type={type}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Erreur lors de la récupération des utilisateurs depuis le service utilisateur.");
            }

            var users = await response.Content.ReadFromJsonAsync<List<UserDto>>();
            return users ?? new List<UserDto>();
        }

        [HttpPut("start/{evalId}")]
        public async Task<IActionResult> StartEvaluation(int evalId)
        {
            // 1. Récupérer l'évaluation par son ID
            var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);
            if (evaluation == null)
            {
                return NotFound(new { Success = false, Message = "Évaluation non trouvée." });
            }

            // 2. Mettre à jour l'état de l'évaluation à "En cours"
            evaluation.EtatId = 2;
            _context.Evaluations.Update(evaluation);
            await _context.SaveChangesAsync(); // Sauvegarde pour que l'état soit bien mis à jour avant la suite

            // 3. Récupérer les utilisateurs de type spécifique (par exemple, "Cadre" ou "Non-Cadre")
            var users = await GetUsersByTypeAsync(evaluation.Type); // Par exemple "Cadre" ou "Non-Cadre"

            // 4. Insérer les utilisateurs dans UserEvaluations s'ils ne sont pas déjà associés
            foreach (var user in users)
            {
                // Vérifier si l'utilisateur est déjà associé à cette évaluation
                bool alreadyAssigned = await _context.UserEvaluations.AnyAsync(ue => ue.EvalId == evalId && ue.UserId == user.Id);
                if (!alreadyAssigned)
                {
                    var userEvaluation = new UserEvaluation
                    {
                        EvalId = evalId,
                        UserId = user.Id
                    };
                    _context.UserEvaluations.Add(userEvaluation);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Évaluation démarrée avec succès et utilisateurs ajoutés." });
        }


        [HttpGet("enCours/{evalId}/{userId}")]
        private async Task<int?> GetUserEvalIdAsync(int evalId, string userId)
        {
            var userEvaluation = await _context.UserEvaluations
                .FirstOrDefaultAsync(ue => ue.EvalId == evalId && ue.UserId == userId);

            return userEvaluation?.UserEvalId;
        }

        [HttpGet("enCours/{type}")]
        public async Task<ActionResult<int?>> GetCurrentEvaluationIdByType(string type)
        {
            // Convertir la chaîne en FormType
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Utiliser le formType converti dans la requête
            var evaluation = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluation == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            return Ok(evaluation);
        }

        [HttpGet("userObjectif")]
        public async Task<ActionResult<List<UserObjective>>> GetUserObjectivesAsync(int evalId, string userId)
        {
            try
            {
                int? userEvalId = await GetUserEvalIdAsync(evalId, userId);

                if (userEvalId == null)
                {
                    return NotFound($"UserEvalId introuvable pour evalId '{evalId}' et userId '{userId}'.");
                }

                var objectives = await _context.UserObjectives
                    .Where(uo => uo.UserEvalId == userEvalId)
                    .Include(uo => uo.TemplateStrategicPriority)
                    .Include(uo => uo.ObjectiveColumnValues)
                    .ToListAsync();

                return Ok(objectives);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des objectifs : {ex.Message}");
            }
        }


        [HttpPost("validateObjectivesCadre")]
        public async Task<IActionResult> ValidateObjectivesByType(string userId, string type, List<ObjectiveDto> objectives)
        {
            // Convertir la chaîne en FormType
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupère l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            // Vérifie si une évaluation en cours a été trouvée
            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupère l'ID de l'évaluation utilisateur pour l'utilisateur spécifié
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            // Continue avec le traitement des objectifs
            foreach (var objective in objectives)
            {
                // Crée une entrée d'historique pour l'objectif
                var history = new HistoryCFo
                {
                    UserEvalId = userEvalId.Value,
                    PriorityName = objective.PriorityName,
                    Description = objective.Description,
                    Weighting = objective.Weighting,
                    CreatedAt = DateTime.Now
                };
                _context.HistoryCFos.Add(history);
                await _context.SaveChangesAsync(); // Sauvegarde pour obtenir hcf_id

                // Crée une entrée d'objectif utilisateur
                var userObjective = new UserObjective
                {
                    UserEvalId = userEvalId.Value,
                    PriorityId = objective.PriorityId,
                    Description = objective.Description,
                    Weighting = objective.Weighting,
                    ResultIndicator = null,
                    Result = 0
                };
                _context.UserObjectives.Add(userObjective);
                await _context.SaveChangesAsync(); // Sauvegarde pour obtenir objectiveId

                // Traitement des colonnes dynamiques dans ObjectiveColumnValues et HistoryObjectiveColumnValuesFo
                foreach (var columnValue in objective.DynamicColumns)
                {
                    var column = await _context.ObjectiveColumns.FirstOrDefaultAsync(c => c.Name == columnValue.ColumnName);
                    if (column != null)
                    {
                        var objectiveColumnValue = new ObjectiveColumnValue
                        {
                            ObjectiveId = userObjective.ObjectiveId,
                            ColumnId = column.ColumnId,
                            Value = columnValue.Value
                        };
                        _context.ObjectiveColumnValues.Add(objectiveColumnValue);
                    }

                    var historyColumnValue = new HistoryObjectiveColumnValuesFo
                    {
                        HcfId = history.HcfId,
                        ColumnName = columnValue.ColumnName,
                        Value = columnValue.Value,
                        CreatedAt = DateTime.Now
                    };
                    _context.HistoryObjectiveColumnValuesFos.Add(historyColumnValue);
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Objectifs et colonnes dynamiques de fixation validés et enregistrés." });
        }

        [HttpPost("updateMidtermObjectivesCadre")]
        public async Task<IActionResult> UpdateMidtermObjectives(string userId, string type, List<ObjectiveDto> objectives)
        {
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                foreach (var objective in objectives)
                {
                    // Insérer un enregistrement dans HistoryCMps uniquement
                    var historyMp = new HistoryCMp
                    {
                        UserEvalId = userEvalId.Value,
                        PriorityName = objective.PriorityName,
                        Description = objective.Description,
                        Weighting = objective.Weighting,
                        ResultIndicator = objective.ResultIndicator,
                        Result = objective.Result,
                        UpdatedAt = DateTime.Now
                    };
                    _context.HistoryCMps.Add(historyMp);
                    await _context.SaveChangesAsync(); // Enregistrer le nouvel historique
                }

                await transaction.CommitAsync();
                return Ok(new { Message = "Historique des objectifs de mi-parcours ajouté avec succès." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during transaction: " + ex.Message);
                return StatusCode(500, "Erreur lors de l'insertion dans l'historique.");
            }
        }

//-----------------------------NonCadre---------------------------------------------------------------------------------------------------

        [HttpPost("InsertFixationObjectifData")]
        public async Task<IActionResult> InsertFixationObjectifData(string userId, string type, [FromBody] FixationObjectifDataDto fixationObjectifData)
        {
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupère l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            // Vérifie si une évaluation en cours a été trouvée
            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupère l'ID de l'évaluation utilisateur pour l'utilisateur spécifié
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            try
            {
                foreach (var competence in fixationObjectifData.Competences)
                {
                    var userCompetence = new UserCompetence
                    {
                        UserEvalId = userEvalId.Value,
                        CompetenceId = competence.CompetenceId,
                        Performance = competence.Performance
                    };
                    _context.UserCompetences.Add(userCompetence);

                    var historyUserCompetence = new HistoryUserCompetenceFO
                    {
                        UserEvalId = userEvalId.Value,
                        CompetenceName = competence.Name,
                        Performance = competence.Performance
                    };
                    _context.HistoryUserCompetenceFOs.Add(historyUserCompetence);
                }

                foreach (var indicator in fixationObjectifData.Indicators)
                {
                    var userIndicator = new UserIndicator
                    {
                        UserEvalId = userEvalId.Value,
                        IndicatorId = indicator.IndicatorId,
                        Name = indicator.IndicatorName
                    };
                    _context.UserIndicators.Add(userIndicator);

                    var historyUserIndicator = new HistoryUserIndicatorFO
                    {
                        UserEvalId = userEvalId.Value,
                        Name = indicator.IndicatorName,
                        ResultText = null,
                        Result = null
                    };
                    _context.HistoryUserIndicatorFOs.Add(historyUserIndicator);
                }

                await _context.SaveChangesAsync();
                return Ok("Data inserted successfully");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("UpdateMiParcoursData")]
        public async Task<IActionResult> UpdateMiParcoursData(string userId, string type, [FromBody] MiParcoursDataDto miParcoursData)
        {
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupère l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            // Vérifie si une évaluation en cours a été trouvée
            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupère l'ID de l'évaluation utilisateur pour l'utilisateur spécifié
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            try
            {
                foreach (var competence in miParcoursData.Competences)
                {
                    var userCompetence = await _context.UserCompetences.FirstOrDefaultAsync(uc => uc.UserEvalId == userEvalId.Value && uc.CompetenceId == competence.CompetenceId);
                    if (userCompetence != null)
                    {
                        userCompetence.Performance = competence.Performance;
                        _context.UserCompetences.Update(userCompetence);
                    }

                    var historyUserCompetence = new HistoryUserCompetenceMP
                    {
                        UserEvalId = userEvalId.Value,
                        CompetenceName = competence.Name,
                        Performance = competence.Performance
                    };
                    _context.HistoryUserCompetenceMPs.Add(historyUserCompetence);
                }

                foreach (var indicator in miParcoursData.Indicators)
                {
                    var userIndicator = await _context.UserIndicators.FirstOrDefaultAsync(ui => ui.UserEvalId == userEvalId.Value && ui.IndicatorId == indicator.IndicatorId);
                    if (userIndicator != null)
                    {
                        userIndicator.Name = indicator.IndicatorName;
                        _context.UserIndicators.Update(userIndicator);
                    }

                    var userIndicatorResult = new UserIndicatorResult
                    {
                        UserIndicatorId = userIndicator.UserIndicatorId,
                        ResultText = indicator.ResultText,
                        Result = indicator.Result
                    };
                    _context.UserIndicatorResults.Add(userIndicatorResult);

                    var historyUserIndicator = new HistoryUserIndicatorMP
                    {
                        UserEvalId = userEvalId.Value,
                        Name = indicator.IndicatorName,
                        ResultText = indicator.ResultText,
                        Result = indicator.Result
                    };
                    _context.HistoryUserIndicatorMPs.Add(historyUserIndicator);
                }

                await _context.SaveChangesAsync();
                return Ok("Data updated and inserted successfully for Mi-parcours");
            }
            catch (Exception ex)
            {
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }

    }

    public class FixationObjectifDataDto
    {
        public List<CompetenceDto> Competences { get; set; }
        public List<IndicatorDto> Indicators { get; set; }
    }

    public class MiParcoursDataDto
    {
        public List<CompetenceDto> Competences { get; set; }
        public List<IndicatorDto> Indicators { get; set; }
    }

    public class CompetenceDto
    {
        public int CompetenceId { get; set; }
        public decimal Performance { get; set; }
        public string Name { get; set; }
    }

    public class IndicatorDto
    {
        public int IndicatorId { get; set; }
        public string IndicatorName { get; set; }
        public string ResultText { get; set; }
        public decimal Result { get; set; }
    }
}