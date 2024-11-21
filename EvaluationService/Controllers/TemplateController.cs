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
    public class TemplateController : ControllerBase
    {
        private readonly AppdbContext _context;

        public TemplateController(AppdbContext context)
        {
            _context = context;
        }

        [HttpGet("{templateId}")]
        public async Task<IActionResult> ShowTemplate(int templateId)
        {
            try
            {
                // Récupère le modèle de formulaire avec ses priorités stratégiques actives
                var formTemplate = await _context.FormTemplates
                    .Include(t => t.TemplateStrategicPriorities)
                    .FirstOrDefaultAsync(t => t.TemplateId == templateId);

                if (formTemplate == null)
                {
                    return NotFound("Form template not found.");
                }

                // Récupération des colonnes dynamiques actives
                var dynamicColumns = await _context.ObjectiveColumns
                    .Where(c => c.IsActive)
                    .Select(c => new ObjectiveColumnDto
                    {
                        ColumnId = c.ColumnId,
                        Name = c.Name,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                // Préparation des priorités stratégiques actives avec objectifs vides
                var templatePriorities = formTemplate.TemplateStrategicPriorities
                    .Where(p => p.IsActif) // Filtre uniquement les priorités actives
                    .Select(p => new TemplateStrategicPriorityDto
                    {
                        TemplatePriorityId = p.TemplatePriorityId,
                        Name = p.Name,
                        MaxObjectives = p.MaxObjectives,
                        Objectives = Enumerable.Range(1, p.MaxObjectives)
                            .Select(_ => new ObjectiveDto
                            {
                                Description = "",
                                Weighting = 0,
                                ResultIndicator = "",
                                Result = 0,
                                DynamicColumns = dynamicColumns.Select(col => new ColumnValueDto
                                {
                                    ColumnName = col.Name,
                                    Value = "" // Champ vide pour le formulaire vierge
                                }).ToList()
                            }).ToList()
                    }).ToList();

                // Mapping du template au DTO
                var response = new
                {
                    Template = new FormTemplateDto
                    {
                        TemplateId = formTemplate.TemplateId,
                        Name = formTemplate.Name,
                        CreationDate = formTemplate.CreationDate,
                        TemplateStrategicPriorities = templatePriorities
                    },
                    DynamicColumns = dynamicColumns
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("CadreTemplate")]
        public async Task<IActionResult> GetCadreTemplate()
        {
            try
            {
                // Fetch the template with type 'Cadre'
                var cadreTemplate = await _context.FormTemplates
                    .FirstOrDefaultAsync(t => t.Type == 0);
                if (cadreTemplate == null)
                {
                    return NotFound("Cadre template not found.");
                }

                return Ok(new { TemplateId = cadreTemplate.TemplateId, Name = cadreTemplate.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllPriorities")]
        public async Task<IActionResult> GetAllStrategicPriorities([FromQuery] bool? onlyActive = null)
        {
            try
            {
                // Récupérer toutes les priorités ou uniquement les actives selon le paramètre
                var prioritiesQuery = _context.TemplateStrategicPriorities.AsQueryable();

                if (onlyActive.HasValue && onlyActive.Value)
                {
                    prioritiesQuery = prioritiesQuery.Where(p => p.IsActif);
                }

                var priorities = await prioritiesQuery
                    .Select(p => new
                    {
                        p.TemplatePriorityId,
                        p.Name,
                        p.MaxObjectives,
                        p.TemplateId,
                        p.IsActif
                    })
                    .ToListAsync();

                return Ok(priorities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPut("UpdateCadreTemplateName")]
        public async Task<IActionResult> UpdateCadreTemplateName([FromBody] string newName)
        {
            try
            {
                // Rechercher le template 'Cadre' par son type
                var cadreTemplate = await _context.FormTemplates.FirstOrDefaultAsync(t => t.Type == 0);

                if (cadreTemplate == null)
                {
                    return NotFound("Cadre template not found.");
                }

                // Mettre à jour le nom du template
                cadreTemplate.Name = newName;

                // Sauvegarder les modifications
                await _context.SaveChangesAsync();
                return Ok("Cadre template name updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("AddStrategicPriority")]
        public async Task<IActionResult> AddStrategicPriority([FromBody] StrategicPriorityRequest request)
        {
            try
            {
                // Vérifier si le FormTemplate 'Cadre' associé existe
                var existingTemplate = await _context.FormTemplates.FirstOrDefaultAsync(t => t.Type == 0);
                if (existingTemplate == null)
                {
                    return NotFound("Form template not found.");
                }

                // Vérifier si une priorité stratégique avec le même nom existe déjà
                var existingPriority = await _context.TemplateStrategicPriorities.FirstOrDefaultAsync(p => p.Name == request.Name && p.TemplateId == existingTemplate.TemplateId);
                if (existingPriority != null)
                {
                    return Conflict("A strategic priority with the same name already exists.");
                }

                // Créez un nouvel objet TemplateStrategicPriority
                var newPriority = new TemplateStrategicPriority
                {
                    Name = request.Name,
                    MaxObjectives = request.MaxObjectives,
                    TemplateId = existingTemplate.TemplateId,
                    IsActif = true
                };

                // Ajouter la nouvelle priorité stratégique au contexte
                await _context.TemplateStrategicPriorities.AddAsync(newPriority);

                // Sauvegarder les modifications
                await _context.SaveChangesAsync();
                return Ok("Strategic priority added successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // PUT: api/FormTemplate/UpdatePriority
        [HttpPut("UpdatePriority")]
        public async Task<IActionResult> UpdateStrategicPriority([FromBody] UpdatePriorityRequest request)
        {
            try
            {
                // Récupérer la priorité stratégique à mettre à jour
                var priority = await _context.TemplateStrategicPriorities.FindAsync(request.TemplatePriorityId);

                if (priority == null)
                {
                    return NotFound("Strategic priority not found.");
                }

                // Mise à jour des champs
                priority.Name = request.NewName;
                priority.MaxObjectives = request.NewMaxObjectives;
                priority.IsActif = request.IsActif; // Mise à jour du champ IsActif

                // Sauvegarder les changements
                await _context.SaveChangesAsync();

                return Ok("Strategic priority updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetAllColumns")]
        public async Task<IActionResult> GetAllDynamicColumns([FromQuery] bool? onlyActive = null)
        {
            try
            {
                // Récupérer toutes les colonnes ou uniquement les actives selon le paramètre
                var columnsQuery = _context.ObjectiveColumns.AsQueryable();

                if (onlyActive.HasValue && onlyActive.Value)
                {
                    columnsQuery = columnsQuery.Where(c => c.IsActive);
                }

                var columns = await columnsQuery
                    .Select(c => new
                    {
                        c.ColumnId,
                        c.Name,
                        c.IsActive
                    })
                    .ToListAsync();

                return Ok(columns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // POST: api/FormTemplate/AddDynamicColumn
        [HttpPost("AddDynamicColumn")]
        public async Task<IActionResult> AddDynamicColumn(string columnName)
        {
            try
            {
                var newColumn = new ObjectiveColumn
                {
                    Name = columnName,
                    IsActive = true
                };

                _context.ObjectiveColumns.Add(newColumn);
                await _context.SaveChangesAsync();
                return Ok("Dynamic column added successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT: api/FormTemplate/UpdateDynamicColumn
        [HttpPut("UpdateDynamicColumn")]
        public async Task<IActionResult> UpdateDynamicColumn([FromBody] DynamicColumnUpdateDto columnUpdateDto)
        {
            try
            {
                var column = await _context.ObjectiveColumns.FindAsync(columnUpdateDto.Id);

                if (column == null)
                {
                    return NotFound("Dynamic column not found.");
                }

                column.Name = columnUpdateDto.NewName;
                column.IsActive = columnUpdateDto.IsActive;

                await _context.SaveChangesAsync();
                return Ok("Dynamic column updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // [HttpGet("NonCadreTemplate/{templateId:int}")]
        // public async Task<IActionResult> GetNonCadreTemplate(int templateId)
        // {
        //     try
        //     {
        //         var template = await _context.FormTemplates
        //             .Where(t => t.TemplateId == templateId && t.Type == FormType.NonCadre)
        //             .Include(t => t.Competences)
        //                 .ThenInclude(c => c.CompetenceLevels)
        //             .FirstOrDefaultAsync();

        //         if (template == null)
        //         {
        //             return NotFound("Le modèle de type NonCadre avec cet ID n'existe pas.");
        //         }

        //         var helps = await _context.Helps.ToListAsync();

        //         var levels = await _context.Levels.Select(l => new
        //         {
        //             l.LevelId,
        //             l.LevelName
        //         }).ToListAsync();

        //         var indicators = await _context.Indicators
        //             .Where(i => i.TemplateId == templateId) 
        //             .Select(i => new
        //             {
        //                 i.IndicatorId,
        //                 i.MaxResults,
        //                 i.label
        //             }).ToListAsync();

        //         var result = new
        //         {
        //             TemplateId = template.TemplateId,
        //             Name = template.Name,
        //             CreationDate = template.CreationDate,
        //             Competences = template.Competences.Select(c => new
        //             {
        //                 c.CompetenceId,
        //                 c.Name,
        //                 Levels = c.CompetenceLevels.Select(cl => new
        //                 {
        //                     cl.LevelId,
        //                     cl.Description
        //                 })
        //             }),
        //             Helps = helps.Select(h => new
        //             {
        //                 h.HelpId,
        //                 h.Name
        //             }),
        //             Levels = levels,
        //             Indicators = indicators
        //         };

        //         return Ok(result);
        //     }
        //     catch (Exception ex)
        //     {
        //         return StatusCode(500, "Erreur du serveur : " + ex.Message);
        //     }
        // }

        [HttpGet("NonCadreTemplate/{templateId:int}")]
        public async Task<IActionResult> GetNonCadreTemplate(int templateId)
        {
            try
            {
                var template = await _context.FormTemplates
                    .Where(t => t.TemplateId == templateId && t.Type == FormType.NonCadre)
                    .Include(t => t.Competences)
                        .ThenInclude(c => c.CompetenceLevels)
                    .FirstOrDefaultAsync();

                if (template == null)
                {
                    return NotFound("Le modèle de type NonCadre avec cet ID n'existe pas.");
                }

                var userEvaluationWeights = await _context.UserEvaluationWeights
                    .FirstOrDefaultAsync(w => w.TemplateId == templateId);

                var helps = await _context.Helps.ToListAsync();

                var levels = await _context.Levels.Select(l => new
                {
                    l.LevelId,
                    l.LevelName
                }).ToListAsync();

                var indicators = await _context.Indicators
                    .Where(i => i.TemplateId == templateId) 
                    .Select(i => new
                    {
                        i.IndicatorId,
                        i.MaxResults,
                        i.label
                    }).ToListAsync();

                var result = new
                {
                    TemplateId = template.TemplateId,
                    Name = template.Name,
                    CreationDate = template.CreationDate,
                    CompetenceWeightTotal = userEvaluationWeights?.CompetenceWeightTotal,
                    IndicatorWeightTotal = userEvaluationWeights?.IndicatorWeightTotal,
                    Competences = template.Competences.Select(c => new
                    {
                        c.CompetenceId,
                        c.Name,
                        Levels = c.CompetenceLevels.Select(cl => new
                        {
                            cl.LevelId,
                            cl.Description
                        })
                    }),
                    Helps = helps.Select(h => new
                    {
                        h.HelpId,
                        h.Name
                    }),
                    Levels = levels,
                    Indicators = indicators
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Erreur du serveur : " + ex.Message);
            }
        }


        [HttpGet("NonCadreTemplate")]
        public async Task<IActionResult> GetNonCadreTemplate()
        {
            try
            {
                // Fetch the template with type 'NonCadre'
                var nonCadreTemplate = await _context.FormTemplates
                    .FirstOrDefaultAsync(t => t.Type == FormType.NonCadre);

                if (nonCadreTemplate == null)
                {
                    return NotFound("NonCadre template not found.");
                }

                return Ok(new { TemplateId = nonCadreTemplate.TemplateId, Name = nonCadreTemplate.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetAllTemplates")]
        public async Task<ActionResult<IEnumerable<FormTemplateDto>>> GetAllTemplates()
        {
            var templates = await _context.FormTemplates
                .Select(template => new FormTemplateDto
                {
                    TemplateId = template.TemplateId,
                    Name = template.Name,
                    Type = template.Type,
                    TypeName = template.Type == 0 ? "Cadre" : "Non-Cadre" 
                })
                .ToListAsync();

            return Ok(templates);
        }
    }

    public class DynamicColumnUpdateDto
    {
        public int Id { get; set; } // Cet ID peut être supprimé si on ne souhaite pas l'envoyer depuis le client
        public string NewName { get; set; }
        public bool IsActive { get; set; }
    }

    public class StrategicPriorityRequest
    {
        public string Name { get; set; }
        public int MaxObjectives { get; set; }
    }
    
    public class UpdatePriorityRequest
    {
        public int TemplatePriorityId { get; set; }
        public string NewName { get; set; }
        public int NewMaxObjectives { get; set; }
        public bool IsActif {get; set;}
    }
}
