using EvaluationService.Data;
using EvaluationService.DTOs;
using EvaluationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<EvaluationController> _logger;

        public EvaluationController(AppdbContext context, IHttpClientFactory httpClientFactory, ILogger<EvaluationController> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _logger = logger;
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
                        .ThenInclude(ocv => ocv.ObjectiveColumn) // Inclure le nom de la colonne
                    .ToListAsync();

                return Ok(objectives);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erreur lors de la récupération des objectifs : {ex.Message}");
            }
        }


        [HttpPost("validateUserObjectives")]
        public async Task<IActionResult> ValidateUserObjectives(string userId, string type, List<ObjectiveDto> objectives)
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

            // Liste pour stocker les UserObjective créés
            var createdUserObjectives = new List<UserObjective>();

            // Traiter chaque objectif
            foreach (var objective in objectives)
            {
                // Crée une entrée d'objectif utilisateur
                var userObjective = new UserObjective
                {
                    UserEvalId = userEvalId.Value,
                    PriorityId = objective.PriorityId,
                    Description = objective.Description,
                    Weighting = objective.Weighting,
                    ResultIndicator = null,
                    Result = 0,
                    CreatedBy = userId, // Ajoutez des informations sur l'utilisateur qui a créé
                    CreatedAt = DateTime.Now
                };
                _context.UserObjectives.Add(userObjective);
                await _context.SaveChangesAsync(); // Sauvegarde pour obtenir l'ObjectiveId

                createdUserObjectives.Add(userObjective);

                // Traitement des colonnes dynamiques dans ObjectiveColumnValues
                foreach (var columnValue in objective.DynamicColumns)
                {
                    var column = await _context.ObjectiveColumns.FirstOrDefaultAsync(c => c.Name == columnValue.ColumnName);
                    if (column != null)
                    {
                        var objectiveColumnValue = new ObjectiveColumnValue
                        {
                            ObjectiveId = userObjective.ObjectiveId,
                            ColumnId = column.ColumnId,
                            Value = columnValue.Value ?? "N/A"
                        };
                        _context.ObjectiveColumnValues.Add(objectiveColumnValue);
                    }
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Objectifs validés et enregistrés dans UserObjective.", UserObjectives = createdUserObjectives });
        }

        [HttpPost("validateUserObjectivesHistory")]
        public async Task<IActionResult> ValidateUserObjectivesHistory(
            string validatorUserId,
            string userId,
            string type,
            [FromBody] List<ModifiedUserObjectiveDto> modifiedObjectives)
        {
            if (string.IsNullOrEmpty(validatorUserId))
            {
                return BadRequest(new { Message = "L'identifiant du validateur est requis." });
            }

            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Message = "L'identifiant de l'utilisateur est requis." });
            }

            if (string.IsNullOrEmpty(type))
            {
                return BadRequest(new { Message = "Le type d'évaluation est requis." });
            }

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

            var userObjectives = await _context.UserObjectives
                .Include(uo => uo.ObjectiveColumnValues)
                .ThenInclude(ocv => ocv.ObjectiveColumn)
                .Include(uo => uo.TemplateStrategicPriority)
                .Where(uo => uo.UserEvalId == userEvalId.Value)
                .ToListAsync();


            if (userObjectives.Count == 0)
            {
                return NotFound(new { Message = $"Aucun UserObjective trouvé pour UserEvalId {userEvalId.Value}." });
            }

            var historyEntries = new List<HistoryCFo>();
            var historyColumnEntries = new List<HistoryObjectiveColumnValuesFo>();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var userObjective in userObjectives)
                {
                    // Appliquer les modifications si elles existent
                    var modifiedObjective = modifiedObjectives?.FirstOrDefault(mo => mo.ObjectiveId == userObjective.ObjectiveId);
                    if (modifiedObjective != null)
                    {
                        // Mettre à jour les propriétés principales
                        userObjective.Description = modifiedObjective.Description ?? userObjective.Description;
                        userObjective.Weighting = modifiedObjective.Weighting ?? userObjective.Weighting;
                        userObjective.ResultIndicator = null;
                        userObjective.Result = 0;

                        // Mettre à jour les colonnes associées
                        foreach (var modifiedColumn in modifiedObjective.ObjectiveColumnValues)
                        {
                            var columnToUpdate = userObjective.ObjectiveColumnValues
                                .FirstOrDefault(c => c.ObjectiveColumn != null && c.ObjectiveColumn.Name == modifiedColumn.ColumnName);

                            if (columnToUpdate != null)
                            {
                                columnToUpdate.Value = modifiedColumn.Value; // Appliquer la valeur modifiée
                                _context.ObjectiveColumnValues.Update(columnToUpdate); // Marquer comme modifié
                            }
                        }


                        _context.UserObjectives.Update(userObjective);
                    }

                    // Crée une entrée d'historique pour l'objectif
                    var history = new HistoryCFo
                    {
                        UserEvalId = userObjective.UserEvalId,
                        PriorityName = userObjective.TemplateStrategicPriority.Name,
                        Description = userObjective.Description,
                        Weighting = userObjective.Weighting,
                        CreatedAt = DateTime.Now,
                        ValidatedBy = validatorUserId
                    };
                    _context.HistoryCFos.Add(history);
                    await _context.SaveChangesAsync();

                    historyEntries.Add(history);

                    foreach (var columnValue in userObjective.ObjectiveColumnValues)
                    {
                        var historyColumnValue = new HistoryObjectiveColumnValuesFo
                        {
                            HcfId = history.HcfId,
                            ColumnName = columnValue.ObjectiveColumn?.Name ?? "Nom de colonne inconnu",
                            Value = columnValue.Value,
                            ValidatedBy = validatorUserId,
                            CreatedAt = DateTime.Now
                        };
                        _context.HistoryObjectiveColumnValuesFos.Add(historyColumnValue);
                        historyColumnEntries.Add(historyColumnValue);
                    }
                }


                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Validation effectuée et historique enregistré.",
                    HistoryCFos = historyEntries.Select(h => new
                    {
                        h.HcfId,
                        h.UserEvalId,
                        h.PriorityName,
                        h.Description,
                        h.Weighting,
                        h.ValidatedBy,
                        h.CreatedAt
                    }).ToList(),
                    HistoryObjectiveColumnValuesFos = historyColumnEntries.Select(c => new
                    {
                        c.HcfId,
                        c.ColumnName,
                        c.Value,
                        c.CreatedAt
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Erreur lors de la validation des objectifs.", Details = ex.Message });
            }
        }

        [HttpGet("getUserObjectivesHistory")]
        public async Task<IActionResult> GetUserObjectivesHistory(string userId, string type)
        {
            // Validation des paramètres
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Message = "L'identifiant de l'utilisateur est requis." });
            }

            if (string.IsNullOrEmpty(type))
            {
                return BadRequest(new { Message = "Le type d'évaluation est requis." });
            }

            // Conversion du type d'évaluation
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupération de l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupération de l'ID de l'évaluation utilisateur
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            // Récupération des entrées de l'historique
            var historyEntries = await _context.HistoryCFos
                .Where(h => h.UserEvalId == userEvalId.Value)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            // Vérification des résultats
            if (historyEntries.Count == 0)
            {
                return NotFound(new { Message = $"Aucun historique trouvé pour l'utilisateur {userId} et le type {type}." });
            }

            // Retour des données
            return Ok(new
            {
                Message = "Historique récupéré avec succès.",
                HistoryCFos = historyEntries.Select(h => new
                {
                    h.HcfId,
                    h.UserEvalId,
                    h.PriorityName,
                    h.Description,
                    h.Weighting,
                    h.ValidatedBy,
                    h.CreatedAt
                }).ToList()
            });
        }


        [HttpPost("validateMitermObjectif")]
        public async Task<IActionResult> ValidateMitermObjectif(
            string validatorUserId,
            string userId,
            string type,
            [FromBody] List<ModifiedUserObjectiveDto> objectives)
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

                foreach (var modifiedObjective in objectives)
                {
                    // Fetch the UserObjective by PriorityId
                    var userObjective = await _context.UserObjectives
                        .Include(uo => uo.ObjectiveColumnValues)
                        .ThenInclude(ocv => ocv.ObjectiveColumn)
                        .FirstOrDefaultAsync(uo => uo.UserEvalId == userEvalId.Value && uo.ObjectiveId == modifiedObjective.ObjectiveId);


                    if (userObjective == null)
                    {
                        return BadRequest(new { Message = $"L'objectif avec la priorité ID {modifiedObjective.ObjectiveId} n'existe pas pour cet utilisateur." });
                    }

                    // Update UserObjective fields
                    userObjective.Description = modifiedObjective.Description ?? userObjective.Description;
                    userObjective.Weighting = modifiedObjective.Weighting ?? userObjective.Weighting;
                    userObjective.ResultIndicator = modifiedObjective.ResultIndicator;
                    userObjective.Result = modifiedObjective.Result;

                    _context.UserObjectives.Update(userObjective);

                    // Update or insert ObjectiveColumnValues
                    foreach (var modifiedColumn in modifiedObjective.ObjectiveColumnValues ?? new List<ColumnValueDto>())
                    {
                        var columnToUpdate = userObjective.ObjectiveColumnValues
                            .FirstOrDefault(c => c.ObjectiveColumn != null && c.ObjectiveColumn.Name == modifiedColumn.ColumnName);


                        if (columnToUpdate != null)
                        {
                            // Update the existing column value
                            columnToUpdate.Value = modifiedColumn.Value;
                            _context.ObjectiveColumnValues.Update(columnToUpdate);
                        }
                        else
                        {
                            // Check if the column exists in the database
                            var column = await _context.ObjectiveColumns
                                .FirstOrDefaultAsync(c => c.Name == modifiedColumn.ColumnName);

                            if (column == null)
                            {
                                // Throw an error if the column doesn't exist
                                throw new InvalidOperationException($"The column '{modifiedColumn.ColumnName}' does not exist in the database.");
                            }

                            // If the column exists but is not linked to the current UserObjective, return an error
                            return BadRequest(new { Message = $"The column '{modifiedColumn.ColumnName}' is not linked to the current UserObjective." });
                        }
                    }

                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Mise à jour des objectifs et colonnes dynamiques effectuée avec succès." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during transaction: {ex.Message}");
                return StatusCode(500, "Erreur lors de la mise à jour des objectifs et colonnes dynamiques.");
            }
        }


        [HttpPost("validateMitermObjectifHistory")]
        public async Task<IActionResult> ValidateMitermObjectifHistory(
        string userId,
        string type,
        List<ObjectiveDto> objectives)
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
                    // Insérer dans HistoryCMp
                    var historyMp = new HistoryCMp
                    {
                        UserEvalId = userEvalId.Value,
                        PriorityName = objective.PriorityName,
                        Description = objective.Description,
                        Weighting = objective.Weighting,
                        ResultIndicator = objective.ResultIndicator,
                        Result = objective.Result,
                        UpdatedAt = DateTime.Now,
                        ValidatedBy = userId
                    };
                    _context.HistoryCMps.Add(historyMp);
                    await _context.SaveChangesAsync();

                    var hcmId = historyMp.HcmId;

                    // Insérer dans HistoryObjectiveColumnValuesMp
                    foreach (var columnValue in objective.DynamicColumns)
                    {
                        var historyColumnValue = new HistoryObjectiveColumnValuesMp
                        {
                            HcmId = hcmId,
                            ColumnName = columnValue.ColumnName,
                            Value = columnValue.Value,
                            CreatedAt = DateTime.Now,
                            ValidatedBy = userId
                        };
                        _context.HistoryObjectiveColumnValuesMps.Add(historyColumnValue);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Validation effectuée et historique ajouté avec succès." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during transaction: " + ex.Message);
                return StatusCode(500, "Erreur lors de la validation et de l'insertion dans HistoryCMp.");
            }
        }

        [HttpGet("getHistoryMidtermeByUser")]
        public async Task<IActionResult> GetHistoryCMps(string userId, string type)
        {
            // Vérification des paramètres
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { Message = "L'identifiant de l'utilisateur est requis." });
            }

            if (string.IsNullOrEmpty(type))
            {
                return BadRequest(new { Message = "Le type d'évaluation est requis." });
            }

            // Conversion du type d'évaluation
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupération de l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupération de l'ID de l'évaluation utilisateur
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            // Récupération des données de l'historique
            var history = await _context.HistoryCMps
                .Where(h => h.UserEvalId == userEvalId)
                .ToListAsync();

            if (history == null || !history.Any())
            {
                return NotFound(new { Message = "Aucun historique trouvé pour cet utilisateur." });
            }

            return Ok(history);
        }





        //-----------------------------NonCadre---------------------------------------------------------------------------------------------------


        [HttpGet("IndicatorValidateByUser")]
        public async Task<IActionResult> GetUserIndicatorsAsync(string userId, string type)
        {
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupération de l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            System.Console.WriteLine(evaluationId);


            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupération de l'ID de l'évaluation utilisateur
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }
            System.Console.WriteLine("userEvalId" + userEvalId);

            var userIndicators = await _context.UserIndicators
                .Where(ui => ui.UserEvalId == userEvalId)
                .Select(ui => new
                {
                    UserIndicatorId = ui.UserIndicatorId,
                    UserEvalId = ui.UserEvalId,
                    Name = ui.Name,
                    IndicatorId = ui.Indicator.IndicatorId,
                    IndicatorLabel = ui.Indicator.label,
                    MaxResults = ui.Indicator.MaxResults,
                    TemplateId = ui.Indicator.TemplateId
                })
                .ToListAsync();


            if (userIndicators == null || !userIndicators.Any())
            {
                return NotFound(new { Message = "Aucun indicateur trouvé pour l'utilisateur spécifié." });
            }

            // Retourne les résultats
            return Ok(userIndicators);
        }


        [HttpPost("ValidateIndicator")]
        public async Task<IActionResult> InsertIndicatorObjectif(
            string userId,
            string type,
            [FromBody] List<IndicatorDto> indicators)
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
                foreach (var indicator in indicators)
                {
                    // Insérer dans UserIndicator
                    var userIndicator = new UserIndicator
                    {
                        UserEvalId = userEvalId.Value,
                        IndicatorId = indicator.IndicatorId,
                        Name = indicator.IndicatorName
                    };
                    _context.UserIndicators.Add(userIndicator);
                    await _context.SaveChangesAsync();
                }

                await _context.SaveChangesAsync();
                return Ok(new { Message = "UserIndicators and associated results inserted successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"An error occurred: {ex.Message}" });
            }
        }


        [HttpPost("ValidateIndicatorHistory")]
        public async Task<IActionResult> InsertIndicatorObjectifHistory(
            string userId,
            string validateUserId,
            string type,
            [FromBody] List<IndicatorDto> indicators)
        {
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupérer l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupérer l'ID de l'évaluation utilisateur pour l'utilisateur spécifié
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            try
            {
                // Récupérer tous les UserIndicators pour cet utilisateur et cette évaluation
                var existingIndicators = await _context.UserIndicators
                    .Where(ui => ui.UserEvalId == userEvalId.Value)
                    .ToListAsync();

                if (!existingIndicators.Any())
                {
                    return NotFound(new { Message = "Aucun UserIndicator trouvé pour cet utilisateur et cette évaluation." });
                }

                // Parcourir les indicateurs existants pour mise à jour et ajout à l'historique
                foreach (var existingIndicator in existingIndicators)
                {
                    // Vérifier si l'indicateur est présent dans les données fournies
                    var updatedIndicator = indicators.FirstOrDefault(ind => ind.IndicatorId == existingIndicator.IndicatorId);

                    // Mise à jour si nécessaire
                    if (updatedIndicator != null && existingIndicator.Name != updatedIndicator.IndicatorName)
                    {
                        existingIndicator.Name = updatedIndicator.IndicatorName;
                        _context.UserIndicators.Update(existingIndicator);
                    }

                    // Insérer dans l'historique
                    var historyUserIndicator = new HistoryUserIndicatorFO
                    {
                        UserEvalId = userEvalId.Value,
                        Name = existingIndicator.Name, // Nom après mise à jour (le cas échéant)
                        ResultText = "N/A", // Valeur par défaut
                        Result = 0, // Valeur par défaut
                        ValidatedBy = validateUserId, // Utilisateur validateur
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.HistoryUserIndicatorFOs.Add(historyUserIndicator);
                }

                // Sauvegarder les mises à jour et les ajouts dans l'historique
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Tous les UserIndicators correspondants ont été mis à jour et ajoutés dans l'historique avec succès." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Une erreur est survenue : {ex.Message}" });
            }
        }


        [HttpGet("{evalId}/competences/{userId}")]
        public async Task<IActionResult> GetUserCompetencesAsync(int evalId, string userId)
        {
            int? userEvalId = await GetUserEvalIdAsync(evalId, userId);

            if (userEvalId == null)
            {
                return NotFound($"UserEvalId introuvable pour evalId '{evalId}' et userId '{userId}'.");
            }

            var competences = await _context.UserCompetences
                .Where(c => c.UserEvalId == userEvalId)
                .Join(
                    _context.Competences, // Jointure avec la table Competences
                    userCompetence => userCompetence.CompetenceId,
                    competence => competence.CompetenceId,
                    (userCompetence, competence) => new UserCompetenceDto
                    {
                        UserCompetenceId = userCompetence.UserCompetenceId,
                        UserEvalId = userCompetence.UserEvalId,
                        CompetenceId = userCompetence.CompetenceId,
                        Performance = userCompetence.Performance,
                        CompetenceName = competence.Name // Ajout du nom de la compétence
                    }
                )
                .ToListAsync();

            if (competences == null || competences.Count == 0)
            {
                return NotFound($"Aucune compétence trouvée pour userEvalId '{userEvalId}'.");
            }

            return Ok(competences);
        }

        [HttpGet("{evalId}/indicators/{userId}")]
        public async Task<IActionResult> GetUserIndicatorsAsync(int evalId, string userId)
        {
            // Récupère l'ID de l'évaluation utilisateur pour l'utilisateur spécifié
            int? userEvalId = await GetUserEvalIdAsync(evalId, userId);

            if (userEvalId == null)
            {
                return NotFound(new { Message = $"UserEvalId introuvable pour evalId '{evalId}' et userId '{userId}'." });
            }

            // Récupère les indicateurs avec leurs résultats associés
            var indicators = await _context.UserIndicators
                .Include(i => i.UserIndicatorResults) // Inclut les résultats associés
                .Where(i => i.UserEvalId == userEvalId)
                .Select(i => new IndicatorDto
                {
                    IndicatorId = i.IndicatorId,
                    IndicatorName = i.Name,
                    Results = i.UserIndicatorResults.Select(r => new ResultDto
                    {
                        ResultText = r.ResultText,
                        Result = r.Result
                    }).ToList()
                })
                .ToListAsync();

            if (indicators == null || indicators.Count == 0)
            {
                return NotFound(new { Message = $"Aucun indicateur trouvé pour userEvalId '{userEvalId}'." });
            }

            return Ok(indicators);
        }

        [HttpPost("ValidateResultManager")]
        public async Task<IActionResult> ValidateResultManager(string userId, string type, [FromBody] MiParcoursDataDto miParcoursData)
        {
            // Validation du type d'évaluation
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
                // Insertion dans UserCompetence
                foreach (var competence in miParcoursData.Competences)
                {
                    var userCompetence = new UserCompetence
                    {
                        UserEvalId = userEvalId.Value,
                        CompetenceId = competence.CompetenceId,
                        Performance = competence.Performance
                    };
                    _context.UserCompetences.Add(userCompetence);
                }

                // Mise à jour de UserIndicator et insertion des UserIndicatorResult
                foreach (var indicator in miParcoursData.Indicators)
                {
                    var userIndicator = await _context.UserIndicators
                        .FirstOrDefaultAsync(ui => ui.UserEvalId == userEvalId.Value && ui.IndicatorId == indicator.IndicatorId);

                    if (userIndicator == null)
                    {
                        return NotFound(new { Message = $"Indicateur utilisateur non trouvé pour IndicatorId {indicator.IndicatorId}." });
                    }

                    // Mise à jour du nom de l'indicateur
                    userIndicator.Name = indicator.IndicatorName;
                    _context.UserIndicators.Update(userIndicator);

                    // Supprimer les anciens résultats pour éviter les doublons
                    var existingResults = await _context.UserIndicatorResults
                        .Where(r => r.UserIndicatorId == userIndicator.UserIndicatorId)
                        .ToListAsync();

                    if (existingResults.Any())
                    {
                        _context.UserIndicatorResults.RemoveRange(existingResults);
                    }

                    // Insertion des nouveaux résultats
                    foreach (var result in indicator.Results)
                    {
                        var userIndicatorResult = new UserIndicatorResult
                        {
                            UserIndicatorId = userIndicator.UserIndicatorId,
                            ResultText = result.ResultText,
                            Result = result.Result
                        };
                        _context.UserIndicatorResults.Add(userIndicatorResult);
                    }
                }

                // Sauvegarde des modifications dans la base de données
                await _context.SaveChangesAsync();
                return Ok("Data inserted and updated successfully.");
            }
            catch (Exception ex)
            {
                // Gestion des erreurs
                return BadRequest($"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("IsResultValidateByManager")]
        public async Task<IActionResult> VerifyEvaluationDataAsync(string userId, string type)
        {
            // Vérifie si le type fourni correspond à une énumération valide
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // Récupère l'ID de l'évaluation en cours pour le type spécifié
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // Récupère l'ID de l'évaluation utilisateur
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            var competences = await _context.UserCompetences
                .Where(uc => uc.UserEvalId == userEvalId)
                .ToListAsync();

            var indicatorResults = await _context.UserIndicatorResults
                .Join(_context.UserIndicators,
                    uir => uir.UserIndicatorId,
                    ui => ui.UserIndicatorId,
                    (uir, ui) => new { uir, ui })
                .Where(joined => joined.ui.UserEvalId == userEvalId)
                .Select(joined => joined.uir)
                .ToListAsync();

            // Retourne les données trouvées ou null si aucune donnée n'est disponible
            return Ok(new
            {
                Competences = competences.Any() ? competences : null,
                IndicatorResults = indicatorResults.Any() ? indicatorResults : null
            });
        }


        [HttpPost("ArchiveMiParcoursData")]
        public async Task<IActionResult> ArchiveMiParcoursData(string userId, string type)
        {
            // 1. Validate the type parameter
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // 2. Retrieve the current evaluation ID based on type and EtatId
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // 3. Retrieve the user evaluation ID for the given user and evaluation
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            try
            {
                // 4. Archive UserCompetences
                var userCompetences = await _context.UserCompetences
                    .Where(uc => uc.UserEvalId == userEvalId.Value)
                    .Include(uc => uc.Competence) // Assuming Competence is a navigation property
                    .ToListAsync();

                foreach (var competence in userCompetences)
                {
                    var historyCompetence = new HistoryUserCompetenceMP
                    {
                        UserEvalId = competence.UserEvalId,
                        CompetenceName = competence.Competence != null ? competence.Competence.Name : "N/A", // Adjust based on your Competence model
                        Performance = competence.Performance
                    };
                    _context.HistoryUserCompetenceMPs.Add(historyCompetence);
                }

                // 5. Archive UserIndicators and UserIndicatorResults
                var userIndicators = await _context.UserIndicators
                    .Where(ui => ui.UserEvalId == userEvalId.Value)
                    .Include(ui => ui.UserIndicatorResults)
                    .ToListAsync();

                foreach (var indicator in userIndicators)
                {
                    if (indicator.UserIndicatorResults != null && indicator.UserIndicatorResults.Any())
                    {
                        foreach (var result in indicator.UserIndicatorResults)
                        {
                            var historyIndicator = new HistoryUserIndicatorMP
                            {
                                UserEvalId = indicator.UserEvalId,
                                Name = indicator.Name,
                                ResultText = result.ResultText,
                                Result = result.Result
                            };
                            _context.HistoryUserIndicatorMPs.Add(historyIndicator);
                        }
                    }
                    else
                    {
                        // If there are no results, you might still want to archive the indicator with default values
                        var historyIndicator = new HistoryUserIndicatorMP
                        {
                            UserEvalId = indicator.UserEvalId,
                            Name = indicator.Name,
                            ResultText = "Aucun résultat disponible.",
                            Result = 0 // Or any default value you deem appropriate
                        };
                        _context.HistoryUserIndicatorMPs.Add(historyIndicator);
                    }
                }

                // 6. Save all changes to the database
                await _context.SaveChangesAsync();

                return Ok("Données archivées avec succès.");
            }
            catch (Exception ex)
            {
                // Log the exception (you can use a logging framework here)
                Console.Error.WriteLine($"Erreur lors de l'archivage des données Mi-Parcours: {ex.Message}");
                return BadRequest(new { Message = $"Une erreur est survenue lors de l'archivage: {ex.Message}" });
            }
        }

        [HttpGet("IsResultValidateByUser")]

        public async Task<IActionResult> IsResultValidateByUser(string userId, string type)
        {
            // 1. Validate the type parameter
            if (!Enum.TryParse<FormType>(type, true, out var formType))
            {
                return BadRequest(new { Message = "Type d'évaluation invalide. Utilisez 'Cadre' ou 'NonCadre'." });
            }

            // 2. Retrieve the current evaluation ID based on type and EtatId
            var evaluationId = await _context.Evaluations
                .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                .Select(e => e.EvalId)
                .FirstOrDefaultAsync();

            if (evaluationId == 0)
            {
                return NotFound(new { Message = $"Aucune évaluation en cours pour le type {type}." });
            }

            // 3. Retrieve the user evaluation ID for the given user and evaluation
            var userEvalId = await GetUserEvalIdAsync(evaluationId, userId);
            if (userEvalId == null)
            {
                return NotFound(new { Message = "Évaluation utilisateur non trouvée." });
            }

            // 4. Fetch data from HistoryUserCompetenceMPs
            var competences = await _context.HistoryUserCompetenceMPs
                .Where(c => c.UserEvalId == userEvalId)
                .ToListAsync();

            // 5. Fetch data from HistoryUserIndicatorMPs
            var indicators = await _context.HistoryUserIndicatorMPs
                .Where(i => i.UserEvalId == userEvalId)
                .ToListAsync();

            // 6. Return the combined result
            return Ok(new
            {
                UserEvalId = userEvalId,
                Competences = competences,
                Indicators = indicators
            });
        }

        [HttpPost("InsertHelpContentsAndArchive")]
        public async Task<IActionResult> InsertHelpContentsAndArchive([FromBody] List<UserHelpContentRequest> helpContents)
        {
            if (helpContents == null || !helpContents.Any())
            {
                return BadRequest(new { Message = "Aucun contenu à traiter." });
            }

            try
            {
                foreach (var helpContentRequest in helpContents)
                {
                    // 1. Valider le type d'évaluation
                    if (!Enum.TryParse<FormType>(helpContentRequest.Type, true, out var formType))
                    {
                        return BadRequest(new { Message = $"Type d'évaluation invalide pour l'élément {helpContentRequest.HelpId}. Utilisez 'Cadre' ou 'NonCadre'." });
                    }

                    // 2. Récupérer l'évaluation actuelle basée sur le type et l'état
                    var evaluationId = await _context.Evaluations
                        .Where(e => e.EtatId == 2 && e.FormTemplate.Type == formType)
                        .Select(e => e.EvalId)
                        .FirstOrDefaultAsync();

                    if (evaluationId == 0)
                    {
                        return NotFound(new { Message = $"Aucune évaluation en cours pour le type {helpContentRequest.Type}." });
                    }

                    // 3. Récupérer le UserEvalId pour le userId et l'évaluation
                    var userEvalId = await GetUserEvalIdAsync(evaluationId, helpContentRequest.UserId);
                    if (userEvalId == null)
                    {
                        return NotFound(new { Message = $"Évaluation utilisateur non trouvée pour l'utilisateur {helpContentRequest.UserId}." });
                    }

                    // 4. Récupérer le contenu existant ou le créer si inexistant
                    var userHelpContent = await _context.UserHelpContents
                        .FirstOrDefaultAsync(uhc => uhc.UserEvalId == userEvalId.Value && uhc.HelpId == helpContentRequest.HelpId);

                    if (userHelpContent == null)
                    {
                        // Créer un nouveau contenu d'aide
                        userHelpContent = new UserHelpContent
                        {
                            UserEvalId = userEvalId.Value,
                            HelpId = helpContentRequest.HelpId,
                            WriterUserId = helpContentRequest.WriterUserId,
                            Content = helpContentRequest.Content
                        };
                        _context.UserHelpContents.Add(userHelpContent);
                    }
                    else
                    {
                        // Mettre à jour le contenu existant
                        userHelpContent.WriterUserId = helpContentRequest.WriterUserId;
                        userHelpContent.Content = helpContentRequest.Content;
                    }

                    // 5. Toujours archiver le contenu dans l'historique
                    var historyContent = new HistoryUserHelpContent
                    {
                        ContentId = userHelpContent.ContentId, // Toujours lié au UserHelpContent
                        HelpId = helpContentRequest.HelpId,
                        HelpName = _context.Helps.FirstOrDefault(h => h.HelpId == helpContentRequest.HelpId)?.Name ?? "N/A",
                        UserEvalId = userHelpContent.UserEvalId,
                        WriterUserId = helpContentRequest.WriterUserId,
                        Content = helpContentRequest.Content,
                        ArchivedAt = DateTime.UtcNow
                    };
                    _context.HistoryUserHelpContents.Add(historyContent);
                }

                // Sauvegarder les modifications dans la base de données
                await _context.SaveChangesAsync();

                return Ok("Contenus ajoutés ou mis à jour et archivés avec succès.");
            }
            catch (Exception ex)
            {
                // Gestion des erreurs
                Console.Error.WriteLine($"Erreur lors de l'insertion ou de l'archivage des contenus : {ex.Message}");
                return BadRequest(new { Message = $"Une erreur est survenue : {ex.Message}" });
            }
        }

        [HttpGet("CheckWriterValidation")]
        public async Task<IActionResult> CheckWriterValidation(int evalId, string userId, int helpId, string writerUserId)
        {
            try
            {
                // Récupérer le UserEvalId à partir de l'évaluation et de l'utilisateur
                var userEvalId = await GetUserEvalIdAsync(evalId, userId);
                if (userEvalId == null)
                {
                    return NotFound(new { Message = $"Aucune évaluation utilisateur trouvée pour l'utilisateur {userId} et l'évaluation {evalId}." });
                }

                // Vérifier si le HelpId est actif pour cette évaluation
                var isHelpActiveForEval = await _context.Helps
                    .Where(h => h.HelpId == helpId) // Vérifier le HelpId donné
                    .Join(
                        _context.Evaluations,
                        help => help.TemplateId,       // Clé étrangère TemplateId dans Helps
                        eval => eval.TemplateId,      // Clé TemplateId dans Evaluations
                        (help, eval) => new { help, eval } // Associer Helps et Evaluations
                    )
                    .AnyAsync(he => he.eval.EvalId == evalId && he.help.IsActive);

                if (!isHelpActiveForEval)
                {
                    return NotFound(new { Message = $"Le contenu HelpId {helpId} n'est pas actif pour l'évaluation {evalId}." });
                }

                // Vérifier si le WriterUserId a validé ce contenu
                var isValidated = await _context.UserHelpContents
                    .AnyAsync(uhc => uhc.UserEvalId == userEvalId.Value
                                    && uhc.HelpId == helpId
                                    && uhc.WriterUserId == writerUserId);

                // Retourner le résultat
                if (isValidated)
                {
                    return Ok(new { Message = $"L'utilisateur WriterUserId {writerUserId} a déjà validé ce contenu.", IsValidated = true });
                }
                else
                {
                    return Ok(new { Message = $"L'utilisateur WriterUserId {writerUserId} n'a pas encore validé ce contenu.", IsValidated = false });
                }
            }
            catch (Exception ex)
            {
                // Gestion des erreurs
                Console.Error.WriteLine($"Erreur lors de la vérification de validation : {ex.Message}");
                return BadRequest(new { Message = $"Une erreur est survenue : {ex.Message}" });
            }
        }

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
    }

    public class IndicatorDto
    {
        public int IndicatorId { get; set; }
        public string IndicatorName { get; set; }
        public List<ResultDto> Results { get; set; }
    }

    public class ResultDto
    {
        public string ResultText { get; set; }
        public decimal Result { get; set; }
    }

    public class ModifiedUserObjectiveDto
    {
        public int ObjectiveId { get; set; }
        public string indicatorName { get; set; }
        public string? Description { get; set; }
        public decimal? Weighting { get; set; }
        public string? ResultIndicator { get; set; }
        public decimal? Result { get; set; }
        public List<ColumnValueDto>? ObjectiveColumnValues { get; set; }
    }

    public class UserHelpContentRequest
    {
        public string UserId { get; set; }
        public string WriterUserId { get; set; }
        public string Type { get; set; } // "Cadre" ou "NonCadre"
        public int HelpId { get; set; }
        public string Content { get; set; }
    }
}