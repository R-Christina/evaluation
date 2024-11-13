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
                // Récupère le modèle de formulaire avec ses priorités stratégiques
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

                // Préparation des priorités stratégiques avec objectifs vides
                var templatePriorities = formTemplate.TemplateStrategicPriorities
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


        // PUT: api/FormTemplate/UpdatePriority
        [HttpPut("UpdatePriority")]
        public async Task<IActionResult> UpdateStrategicPriority(int templatePriorityId, string newName, int newMaxObjectives)
        {
            try
            {
                var priority = await _context.TemplateStrategicPriorities.FindAsync(templatePriorityId);

                if (priority == null)
                {
                    return NotFound("Strategic priority not found.");
                }

                priority.Name = newName;
                priority.MaxObjectives = newMaxObjectives;

                await _context.SaveChangesAsync();
                return Ok("Strategic priority updated successfully.");
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
        public async Task<IActionResult> UpdateDynamicColumn(int columnId, string newName, bool isActive)
        {
            try
            {
                var column = await _context.ObjectiveColumns.FindAsync(columnId);

                if (column == null)
                {
                    return NotFound("Dynamic column not found.");
                }

                column.Name = newName;
                column.IsActive = isActive;

                await _context.SaveChangesAsync();
                return Ok("Dynamic column updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

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
}
