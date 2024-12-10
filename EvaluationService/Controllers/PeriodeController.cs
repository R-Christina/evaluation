using EvaluationService.Data;
using EvaluationService.DTOs;
using EvaluationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PeriodeController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly AuthorizationService _authorizationService;

        public PeriodeController(AppdbContext context, AuthorizationService authorizationService)
        {
            _context = context;
            _authorizationService = authorizationService;
        }

        [HttpGet("AllEvaluation")]
        public async Task<List<EvaluationDto>> GetAllEvaluations()
        {
            return await _context.Evaluations
                .Include(e => e.Etat)
                .OrderByDescending(e => e.EvalAnnee) // Trier par année du plus récent au plus ancien
                .Select(e => new EvaluationDto
                {
                    EvalId = e.EvalId,
                    EvalAnnee = e.EvalAnnee,
                    FixationObjectif = e.FixationObjectif,
                    MiParcours = e.MiParcours,
                    Final = e.Final,
                    EtatId = e.EtatId,
                    TemplateId = e.TemplateId,
                    Titre = e.Titre,
                    EtatDesignation = e.Etat.EtatDesignation
                })
                .ToListAsync();
        }

        // [HttpPost]
        // public async Task<IActionResult> PostEvaluation([FromBody] EvaluationDto evaluationDto, [FromQuery] string userId)
        // {
        //     int requiredHabilitationAdminId = 3;
            
        //     // Vérification de l'autorisation via le service d'autorisation
        //     var isAuthorized = await _authorizationService.UserHasAccess(userId, requiredHabilitationAdminId);
        //     if (!isAuthorized)
        //     {
        //         return Forbid("Vous n'avez pas l'autorisation d'effectuer cette action.");
        //     }

        //     var errorResponse = new ErrorResponse { Success = false };

        //     // Règles de validation pour EvaluationDto
        //     var validationRules = new Dictionary<Func<EvaluationDto, bool>, string>
        //     {
        //         { eval => eval.EvalAnnee < 2000 || eval.EvalAnnee > 2100, "L'année d'évaluation doit être entre 2000 et 2100." }
        //     };

        //     // Application des règles de validation
        //     foreach (var rule in validationRules)
        //     {
        //         if (rule.Key(evaluationDto))
        //         {
        //             errorResponse.Errors.Add(rule.Value);
        //         }
        //     }

        //     // Nouvelle étape de validation pour vérifier l'existence d'une évaluation similaire
        //     if (!string.IsNullOrEmpty(evaluationDto.Type))
        //     {
        //         bool evaluationExists = await _context.Evaluations
        //             .AnyAsync(e => e.EvalAnnee == evaluationDto.EvalAnnee && e.Type == evaluationDto.Type);

        //         if (evaluationExists)
        //         {
        //             errorResponse.Errors.Add($"Une évaluation pour les collaborateurs {evaluationDto.Type} pour l'année {evaluationDto.EvalAnnee} existe déjà.");
        //         }
        //     }
        //     else
        //     {
        //         errorResponse.Errors.Add("Le type d'évaluation est requis.");
        //     }

        //     if (errorResponse.Errors.Any())
        //     {
        //         return BadRequest(new { Success = false, Errors = errorResponse.Errors });
        //     }

        //     // Récupération du template
        //     var template = await _context.FormTemplates.FirstOrDefaultAsync(t => t.TemplateId == evaluationDto.TemplateId);
        //     if (template == null)
        //     {
        //         return NotFound(new { Success = false, Message = "Template non trouvé." });
        //     }

        //     decimal competenceWeightTotal = 0;
        //     decimal indicatorWeightTotal = 0;

        //     // Récupérer la pondération uniquement si le type n'est pas "Cadre"
        //     if (evaluationDto.Type == "NonCadre")
        //     {
        //         var userEvaluationWeights = await _context.UserEvaluationWeights.FirstOrDefaultAsync(w => w.TemplateId == evaluationDto.TemplateId);
        //         if (userEvaluationWeights == null)
        //         {
        //             return NotFound(new { Success = false, Message = "Pondération pour le template non trouvée." });
        //         }

        //         competenceWeightTotal = userEvaluationWeights.CompetenceWeightTotal;
        //         indicatorWeightTotal = userEvaluationWeights.IndicatorWeightTotal;
        //     }

        //     var evaluation = new Evaluation
        //     {
        //         EvalAnnee = evaluationDto.EvalAnnee,
        //         FixationObjectif = evaluationDto.FixationObjectif,
        //         MiParcours = evaluationDto.MiParcours,
        //         Final = evaluationDto.Final,
        //         EtatId = evaluationDto.EtatId,
        //         TemplateId = evaluationDto.TemplateId,
        //         Titre = evaluationDto.Titre,
        //         Type = evaluationDto.Type,
        //         CompetenceWeightTotal = competenceWeightTotal,
        //         IndicatorWeightTotal = indicatorWeightTotal
        //     };

        //     try
        //     {
        //         _context.Evaluations.Add(evaluation);
        //         await _context.SaveChangesAsync();
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, new { Success = false, Message = $"Une erreur est survenue lors de l'ajout de l'évaluation: {ex.Message}" });
        //     }

        //     return Ok(new { Success = true, Message = "Évaluation ajoutée avec succès." });
        // }

        [HttpPost]
        public async Task<IActionResult> PostEvaluation([FromBody] EvaluationDto evaluationDto, [FromQuery] string userId)
        {
            var errorResponse = new ErrorResponse { Success = false };

            // Règles de validation pour EvaluationDto
            var validationRules = new Dictionary<Func<EvaluationDto, bool>, string>
            {
                { eval => eval.EvalAnnee < 2000 || eval.EvalAnnee > 2100, "L'année d'évaluation doit être entre 2000 et 2100." }
            };

            // Application des règles de validation
            foreach (var rule in validationRules)
            {
                if (rule.Key(evaluationDto))
                {
                    errorResponse.Errors.Add(rule.Value);
                }
            }

            // Nouvelle étape de validation pour vérifier l'existence d'une évaluation similaire
            if (!string.IsNullOrEmpty(evaluationDto.Type))
            {
                bool evaluationExists = await _context.Evaluations
                    .AnyAsync(e => e.EvalAnnee == evaluationDto.EvalAnnee && e.Type == evaluationDto.Type);

                if (evaluationExists)
                {
                    errorResponse.Errors.Add($"Une évaluation pour les collaborateurs {evaluationDto.Type} pour l'année {evaluationDto.EvalAnnee} existe déjà.");
                }
            }
            else
            {
                errorResponse.Errors.Add("Le type d'évaluation est requis.");
            }

            if (errorResponse.Errors.Any())
            {
                return BadRequest(new { Success = false, Errors = errorResponse.Errors });
            }

            // Récupération du template
            var template = await _context.FormTemplates.FirstOrDefaultAsync(t => t.TemplateId == evaluationDto.TemplateId);
            if (template == null)
            {
                return NotFound(new { Success = false, Message = "Template non trouvé." });
            }

            decimal competenceWeightTotal = 0;
            decimal indicatorWeightTotal = 0;

            // Récupérer la pondération uniquement si le type n'est pas "Cadre"
            if (evaluationDto.Type == "NonCadre")
            {
                var userEvaluationWeights = await _context.UserEvaluationWeights.FirstOrDefaultAsync(w => w.TemplateId == evaluationDto.TemplateId);
                if (userEvaluationWeights == null)
                {
                    return NotFound(new { Success = false, Message = "Pondération pour le template non trouvée." });
                }

                competenceWeightTotal = userEvaluationWeights.CompetenceWeightTotal;
                indicatorWeightTotal = userEvaluationWeights.IndicatorWeightTotal;
            }

            var evaluation = new Evaluation
            {
                EvalAnnee = evaluationDto.EvalAnnee,
                FixationObjectif = evaluationDto.FixationObjectif,
                MiParcours = evaluationDto.MiParcours,
                Final = evaluationDto.Final,
                EtatId = evaluationDto.EtatId,
                TemplateId = evaluationDto.TemplateId,
                Titre = evaluationDto.Titre,
                Type = evaluationDto.Type,
                CompetenceWeightTotal = competenceWeightTotal,
                IndicatorWeightTotal = indicatorWeightTotal
            };

            try
            {
                _context.Evaluations.Add(evaluation);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = $"Une erreur est survenue lors de l'ajout de l'évaluation: {ex.Message}" });
            }

            return Ok(new { Success = true, Message = "Évaluation ajoutée avec succès." });
        }




        [HttpGet("periodeActel")]
        public async Task<List<EvaluationPeriodDto>> GetPeriodeActuel(string type = null)
        {
            // Récupérer les évaluations en cours (EtatId = 2) et filtrer par type
            var evaluationsInProgress = await GetEnCours(2, type); // Adaptation de la méthode GetEnCours pour filtrer par type

            // Initialiser la liste pour les résultats
            var evaluationsWithPeriod = new List<EvaluationPeriodDto>();

            // Déterminer la période pour chaque évaluation
            DateTime currentDate = DateTime.Now;
            foreach (var eval in evaluationsInProgress)
            {
                string period;

                if (currentDate >= eval.FixationObjectif && currentDate < eval.MiParcours)
                {
                    period = "Fixation Objectif";
                }
                else if (currentDate >= eval.MiParcours && currentDate < eval.Final)
                {
                    period = "Mi-Parcours";
                }
                else if (currentDate >= eval.Final)
                {
                    period = "Évaluation Finale";
                }
                else
                {
                    period = "Hors période d'évaluation";
                }

                // Ajouter l'évaluation avec sa période à la liste
                evaluationsWithPeriod.Add(new EvaluationPeriodDto
                {
                    EvalId = eval.EvalId,
                    EvalAnnee = eval.EvalAnnee,
                    FixationObjectif = eval.FixationObjectif,
                    MiParcours = eval.MiParcours,
                    Final = eval.Final,
                    EtatId = eval.EtatId,
                    TemplateId = eval.TemplateId,
                    Titre = eval.Titre,
                    Type = eval.Type,
                    CurrentPeriod = period
                });
            }

            return evaluationsWithPeriod;
        }

        [HttpGet("periodeActuel/{evalId}")]
        public async Task<ActionResult<EvaluationPeriodDto>> GetPeriodeActuelById(int evalId)
        {
            try
            {
                // Récupérer l'évaluation par son ID
                var eval = await _context.Evaluations
                    .Where(e => e.EvalId == evalId)
                    .FirstOrDefaultAsync();

                if (eval == null)
                {
                    return NotFound(new { Message = $"Aucune évaluation trouvée pour l'ID {evalId}." });
                }

                // Déterminer la période actuelle
                DateTime currentDate = DateTime.Now;
                string period;

                if (currentDate >= eval.FixationObjectif && currentDate < eval.MiParcours)
                {
                    period = "Fixation Objectif";
                }
                else if (currentDate >= eval.MiParcours && currentDate < eval.Final)
                {
                    period = "Mi-Parcours";
                }
                else if (currentDate >= eval.Final)
                {
                    period = "Évaluation Finale";
                }
                else
                {
                    period = "Hors période d'évaluation";
                }

                // Créer l'objet DTO avec les détails de l'évaluation
                var evaluationPeriod = new EvaluationPeriodDto
                {
                    EvalId = eval.EvalId,
                    EvalAnnee = eval.EvalAnnee,
                    FixationObjectif = eval.FixationObjectif,
                    MiParcours = eval.MiParcours,
                    Final = eval.Final,
                    EtatId = eval.EtatId,
                    TemplateId = eval.TemplateId,
                    Titre = eval.Titre,
                    Type = eval.Type,
                    CurrentPeriod = period
                };

                return Ok(evaluationPeriod);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"Erreur lors de la récupération de la période actuelle : {ex.Message}" });
            }
        }



        [HttpGet("enCours")]
        public async Task<List<EvaluationDto>> GetEnCours(int etatId = 2, string type = null)
        {
            var query = _context.Evaluations
                .Where(e => e.EtatId == etatId)
                .Select(e => new EvaluationDto
                {
                    EvalId = e.EvalId,
                    EvalAnnee = e.EvalAnnee,
                    FixationObjectif = e.FixationObjectif,
                    MiParcours = e.MiParcours,
                    Final = e.Final,
                    EtatId = e.EtatId,
                    TemplateId = e.TemplateId,
                    Titre = e.Titre,
                    Type = e.FormTemplate.Type.ToString() // Conversion en string ici
                });

            // Charger les données en mémoire avec ToListAsync()
            var evaluations = await query.ToListAsync();

            // Appliquer le filtre de type après chargement en mémoire
            if (!string.IsNullOrEmpty(type))
            {
                evaluations = evaluations.Where(e => e.Type == type).ToList(); // Utiliser ToList ici
            }

            return evaluations;
        }


        // [HttpPut("edit/{evalId}")]
        // public async Task<IActionResult> ModifyEvaluation(int evalId, [FromBody] EvaluationDto evaluationDto, [FromQuery] string userId)
        // {
        //     int requiredHabilitationAdminId = 4;

        //     // Vérification de l'autorisation via le service d'autorisation
        //     var isAuthorized = await _authorizationService.UserHasAccess(userId, requiredHabilitationAdminId);
        //     if (!isAuthorized)
        //     {
        //         return Forbid("Vous n'avez pas l'autorisation d'effectuer cette action.");
        //     }

        //     var errorMessages = new List<string>();

        //     // Dictionnaire des validations pour EvaluationDto
        //     var validationRules = new Dictionary<Func<EvaluationDto, bool>, string>
        //     {
        //         { eval => eval.EvalAnnee < 2000 || eval.EvalAnnee > 2100, "L'année d'évaluation doit être entre 2000 et 2100." }
        //     };

        //     // Vérification des règles de validation
        //     foreach (var rule in validationRules)
        //     {
        //         if (rule.Key(evaluationDto))
        //         {
        //             errorMessages.Add(rule.Value);
        //         }
        //     }

        //     // Si des erreurs de validation sont présentes, renvoyer une réponse BadRequest
        //     if (errorMessages.Count > 0)
        //     {
        //         return BadRequest(new
        //         {
        //             Success = false,
        //             Errors = errorMessages
        //         });
        //     }

        //     // Récupérer l'évaluation existante
        //     var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);
        //     if (evaluation == null)
        //     {
        //         return NotFound(new { Success = false, Message = "Évaluation non trouvée." });
        //     }

        //     // Mettre à jour uniquement les champs spécifiés de l'évaluation
        //     evaluation.EvalAnnee = evaluationDto.EvalAnnee;
        //     evaluation.FixationObjectif = evaluationDto.FixationObjectif;
        //     evaluation.MiParcours = evaluationDto.MiParcours;
        //     evaluation.Final = evaluationDto.Final;
        //     evaluation.TemplateId = evaluationDto.TemplateId;
        //     evaluation.Titre = evaluationDto.Titre;

        //     // Sauvegarder les modifications dans la base de données
        //     try
        //     {
        //         _context.Evaluations.Update(evaluation);
        //         await _context.SaveChangesAsync();
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, new { Success = false, Message = $"Une erreur est survenue lors de la sauvegarde : {ex.Message}" });
        //     }

        //     return Ok(new { Success = true, Message = "Évaluation modifiée avec succès." });
        // }

        [HttpPut("edit/{evalId}")]
        public async Task<IActionResult> ModifyEvaluation(int evalId, [FromBody] EvaluationDto evaluationDto)
        {
            var errorMessages = new List<string>();

            // Dictionnaire des validations pour EvaluationDto
            var validationRules = new Dictionary<Func<EvaluationDto, bool>, string>
            {
                { eval => eval.EvalAnnee < 2000 || eval.EvalAnnee > 2100, "L'année d'évaluation doit être entre 2000 et 2100." }
            };

            // Vérification des règles de validation
            foreach (var rule in validationRules)
            {
                if (rule.Key(evaluationDto))
                {
                    errorMessages.Add(rule.Value);
                }
            }

            // Si des erreurs de validation sont présentes, renvoyer une réponse BadRequest
            if (errorMessages.Count > 0)
            {
                return BadRequest(new
                {
                    Success = false,
                    Errors = errorMessages
                });
            }

            // Récupérer l'évaluation existante
            var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);
            if (evaluation == null)
            {
                return NotFound(new { Success = false, Message = "Évaluation non trouvée." });
            }

            // Mettre à jour uniquement les champs spécifiés de l'évaluation
            evaluation.EvalAnnee = evaluationDto.EvalAnnee;
            evaluation.FixationObjectif = evaluationDto.FixationObjectif;
            evaluation.MiParcours = evaluationDto.MiParcours;
            evaluation.Final = evaluationDto.Final;
            evaluation.TemplateId = evaluationDto.TemplateId;
            evaluation.Titre = evaluationDto.Titre;

            // Sauvegarder les modifications dans la base de données
            try
            {
                _context.Evaluations.Update(evaluation);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = $"Une erreur est survenue lors de la sauvegarde : {ex.Message}" });
            }

            return Ok(new { Success = true, Message = "Évaluation modifiée avec succès." });
        }


        [HttpPut("cloturer/{evalId}")]
        public async Task<IActionResult> CloturerEvaluation(int evalId)
        {
            // Retrieve the evaluation by ID
            var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);

            if (evaluation == null)
            {
                return NotFound(new { Success = false, Message = "Évaluation non trouvée." });
            }

            // Set EtatId to 3 to mark the evaluation as closed
            evaluation.EtatId = 3;

            _context.Evaluations.Update(evaluation);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Évaluation clôturée avec succès." });
        }

        [HttpPut("start/{evalId}")]
        public async Task<IActionResult> StartEvaluation(int evalId)
        {
            // Retrieve the evaluation by ID
            var evaluation = await _context.Evaluations.FirstOrDefaultAsync(e => e.EvalId == evalId);

            if (evaluation == null)
            {
                return NotFound(new { Success = false, Message = "Évaluation non trouvée." });
            }

            // Set EtatId to 2 to mark the evaluation as in progress
            evaluation.EtatId = 2;

            _context.Evaluations.Update(evaluation);
            await _context.SaveChangesAsync();

            return Ok(new { Success = true, Message = "Évaluation démarrée avec succès." });
        }

        [HttpGet("test-authorization")]
        public async Task<IActionResult> TestAuthorization([FromQuery] string userId, [FromQuery] int requiredHabilitationAdminId)
        {
            bool hasAccess = await _authorizationService.UserHasAccess(userId, requiredHabilitationAdminId);
            return Ok(new { userId, requiredHabilitationAdminId, hasAccess });
        }
        

    }

    public class EvaluationPeriodDto : EvaluationDto
    {
        public string CurrentPeriod { get; set; }
    }

    public class ErrorResponse
    {
        public bool Success { get; set; }
        public List<string> Errors { get; set; }

        public ErrorResponse()
        {
            Errors = new List<string>();
        }
    }

}
