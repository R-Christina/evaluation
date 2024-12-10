// using CommonModels.DTOs;
// using CsvHelper;
// using CsvHelper.Configuration;
// using EvaluationService.Data;
// using EvaluationService.Models;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using System.Globalization;
// using Newtonsoft.Json;
// using Microsoft.Extensions.Logging;

// namespace EvaluationService.Controllers
// {
//     [Route("api/[controller]")]
//     [ApiController]
//     public class NonCadreImportController : ControllerBase
//     {
//         private readonly AppdbContext _context;
//         private readonly HttpClient _httpClient;
//         private readonly ILogger<NonCadreImportController> _logger; // Injection du logger

//         public NonCadreImportController(AppdbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<NonCadreImportController> logger)
//         {
//             _context = context;
//             _httpClient = httpClientFactory.CreateClient();
//             _httpClient.BaseAddress = new Uri(configuration["UserService:BaseUrl"]);
//             _logger = logger;
//         }

//         private async Task<List<UserDTO>> GetUsersFromExternalService()
//         {
//             var response = await _httpClient.GetAsync("/api/User/user");

//             if (!response.IsSuccessStatusCode)
//             {
//                 throw new Exception($"Failed to fetch users: {response.StatusCode}");
//             }

//             var content = await response.Content.ReadAsStringAsync();
//             return JsonConvert.DeserializeObject<List<UserDTO>>(content);
//         }

//         [HttpPost("import-non-cadre-evaluation")]
//         public async Task<IActionResult> ImportNonCadreEvaluation([FromForm] ImportNonCadreEvaluationRequest request)
//         {
//             if (request.EvaluationFile == null || request.FixationFile == null || 
//                 request.MiParcoursIndicatorsFile == null || request.MiParcoursCompetenceFile == null || request.FinaleFile == null)
//             {
//                 _logger.LogWarning("Tentative d'importation avec des fichiers manquants.");
//                 return BadRequest("All five files are required.");
//             }

//             using var transaction = await _context.Database.BeginTransactionAsync();

//             try
//             {
//                 _logger.LogInformation("Début de l'importation des données Non-Cadre.");

//                 // Étape 1 : Récupérer les utilisateurs via l'API externe
//                 var users = await GetUsersFromExternalService();

//                 // Étape 2 : Importer l'évaluation
//                 var evaluation = await ImportEvaluationData(request.EvaluationFile);
//                 if (evaluation.Type != "NonCadre")
//                 {
//                     throw new Exception("Evaluation type must be NonCadre.");
//                 }

//                 _context.Evaluations.Add(evaluation);
//                 await _context.SaveChangesAsync();

//                 // Étape 3 : Importer les périodes
//                 var fixationData = await ImportPeriodData<IndicateurFo>(request.FixationFile);
//                 var miParcoursIndicatorsData = await ImportPeriodData<IndicateurMp>(request.MiParcoursIndicatorsFile);
//                 var miParcoursCompetenceData = await ImportPeriodData<CompetenceMp>(request.MiParcoursCompetenceFile);
//                 var finaleData = await ImportPeriodData<IndicateurFi>(request.FinaleFile);

//                 // Étape 4 : Préparer les ajouts des données historiques
//                 var userEvaluations = new List<UserEvaluation>();
//                 var historyFoList = new List<HistoryUserIndicatorFO>();
//                 var historyMpList = new List<HistoryUserIndicatorMP>();
//                 var historyCompetenceMpList = new List<HistoryUserCompetenceMP>();
//                 var historyFiList = new List<HistoryUserindicatorFi>();

//                 foreach (var userMatricule in fixationData.Select(d => d.Matricule).Distinct())
//                 {
//                     var user = users.FirstOrDefault(u => u.Matricule == userMatricule);
//                     if (user == null || user.TypeUser != "NonCadre")
//                     {
//                         throw new Exception($"No matching NonCadre user found for matricule: {userMatricule}");
//                     }

//                     var userEvaluation = new UserEvaluation
//                     {
//                         EvalId = evaluation.EvalId,
//                         UserId = user.Id
//                     };

//                     userEvaluations.Add(userEvaluation);
//                 }

//                 _context.UserEvaluations.AddRange(userEvaluations);
//                 await _context.SaveChangesAsync();

//                 foreach (var userEval in userEvaluations)
//                 {
//                     var matricule = users.First(u => u.Id == userEval.UserId).Matricule;

//                     // Fixation Objectif
//                     foreach (var data in fixationData.Where(d => d.Matricule == matricule))
//                     {
//                         var historyFo = new HistoryUserIndicatorFO
//                         {
//                             UserEvalId = userEval.UserEvalId,
//                             Name = data.Name,
//                             ResultText = data.ResultText,
//                             Result = data.Result,
//                             CreatedAt = DateTime.Now
//                         };
//                         historyFoList.Add(historyFo);
//                     }

//                     // Mi-Parcours - Indicateurs
//                     foreach (var data in miParcoursIndicatorsData.Where(d => d.Matricule == matricule))
//                     {
//                         var historyMp = new HistoryUserIndicatorMP
//                         {
//                             UserEvalId = userEval.UserEvalId,
//                             Name = data.Name,
//                             ResultText = data.ResultText,
//                             Result = data.Result
//                         };
//                         historyMpList.Add(historyMp);
//                     }

//                     // Mi-Parcours - Compétences
//                     foreach (var data in miParcoursCompetenceData.Where(d => d.Matricule == matricule))
//                     {
//                         var historyCompetenceMp = new HistoryUserCompetenceMP
//                         {
//                             UserEvalId = userEval.UserEvalId,
//                             CompetenceName = data.CompetenceName,
//                             Performance = data.Performance
//                         };
//                         historyCompetenceMpList.Add(historyCompetenceMp);
//                     }

//                     // Finale
//                     foreach (var data in finaleData.Where(d => d.Matricule == matricule))
//                     {
//                         var historyFi = new HistoryUserindicatorFi
//                         {
//                             UserEvalId = userEval.UserEvalId,
//                             Name = data.Name,
//                             ResultText = data.ResultText,
//                             Result = data.Result,
//                             CreatedAt = DateTime.Now
//                         };
//                         historyFiList.Add(historyFi);
//                     }
//                 }

//                 // Ajout en masse des données historiques
//                 _context.HistoryUserIndicatorFOs.AddRange(historyFoList);
//                 _context.HistoryUserIndicatorMPs.AddRange(historyMpList);
//                 _context.HistoryUserCompetenceMPs.AddRange(historyCompetenceMpList);
//                 _context.HistoryUserindicatorFis.AddRange(historyFiList);

//                 // Sauvegarder toutes les modifications
//                 await _context.SaveChangesAsync();

//                 // Étape 6 : Commit de la transaction
//                 await transaction.CommitAsync();
//                 _logger.LogInformation("Importation des données Non-Cadre réussie.");
//                 return Ok("Non-Cadre data imported successfully.");
//             }
//             catch (Exception ex)
//             {
//                 _logger.LogError(ex, "Erreur lors de l'importation des données Non-Cadre.");
//                 // En cas d'erreur, rollback de la transaction
//                 await transaction.RollbackAsync();
//                 return StatusCode(500, $"Internal server error: {ex.Message}");
//             }
//         }

//         private async Task<Evaluation> ImportEvaluationData(IFormFile evaluationFile)
//         {
//             using var reader = new StreamReader(evaluationFile.OpenReadStream());
//             using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

//             var evaluationData = csv.GetRecords<EvaluationData>().FirstOrDefault();
//             if (evaluationData == null)
//                 throw new Exception("No evaluation data found.");

//             var userEvaluationWeight = await _context.UserEvaluationWeights
//             .FirstOrDefaultAsync(uwe => uwe.TemplateId == evaluationData.TemplateId);

//             return new Evaluation
//             {
//                 EvalAnnee = evaluationData.EvalAnnee,
//                 FixationObjectif = evaluationData.FixationObjectif,
//                 MiParcours = evaluationData.MiParcours,
//                 Final = evaluationData.Finale,
//                 EtatId = evaluationData.EtatId,
//                 TemplateId = evaluationData.TemplateId,
//                 Titre = evaluationData.Titre,
//                 Type = evaluationData.Type,
//                 CompetenceWeightTotal = userEvaluationWeight.CompetenceWeightTotal,
//                 IndicatorWeightTotal = userEvaluationWeight.IndicatorWeightTotal
//             };
//         }

//         private async Task<List<T>> ImportPeriodData<T>(IFormFile file) where T : class
//         {
//             using var reader = new StreamReader(file.OpenReadStream());
//             var config = new CsvConfiguration(CultureInfo.InvariantCulture)
//             {
//                 HeaderValidated = null, // Ignore les en-têtes manquants
//                 MissingFieldFound = null // Ignore les champs manquants
//             };
//             using var csv = new CsvReader(reader, config);

//             // Appliquer le mapping personnalisé si défini
//             if (typeof(T) == typeof(CompetenceMp))
//             {
//                 csv.Context.RegisterClassMap<CompetenceMpMap>();
//             }
//             else if (typeof(T) == typeof(IndicateurFo))
//             {
//                 csv.Context.RegisterClassMap<IndicateurFoMap>();
//             }
//             else if (typeof(T) == typeof(IndicateurMp))
//             {
//                 csv.Context.RegisterClassMap<IndicateurMpMap>();
//             }
//             else if (typeof(T) == typeof(IndicateurFi))
//             {
//                 csv.Context.RegisterClassMap<IndicateurFiMap>();
//             }
//             // Ajoutez d'autres mappings si nécessaire

//             var records = new List<T>();
//             int lineNumber = 1;

//             while (await csv.ReadAsync())
//             {
//                 var rawRecord = csv.Parser.Record;
//                 if (rawRecord == null || rawRecord.All(string.IsNullOrWhiteSpace))
//                 {
//                     Console.WriteLine($"Skipping empty record at line {lineNumber}.");
//                     lineNumber++;
//                     continue;
//                 }

//                 try
//                 {
//                     var record = csv.GetRecord<T>();
//                     records.Add(record);
//                 }
//                 catch (Exception ex)
//                 {
//                     throw new Exception($"Error parsing record at line {lineNumber}: {string.Join(", ", rawRecord)}. Details: {ex.Message}");
//                 }

//                 lineNumber++;
//             }

//             return records;
//         }

//         // La méthode InsertNonCadrePeriodData n'est plus nécessaire car les entités sont ajoutées en masse dans la méthode principale
//         private async Task InsertNonCadrePeriodData(int userEvalId, List<IndicateurFo> fixationData, List<IndicateurMp> miParcoursIndicatorsData, List<CompetenceMp> miParcoursCompetenceData, List<IndicateurFi> finaleData, string matricule)
//         {
//             // Cette méthode est désormais intégrée directement dans la méthode principale
//             // pour permettre un ajout en masse des entités
//             await Task.CompletedTask;
//         }
//     }

//     // Classe de mapping pour CompetenceMp
//     public class CompetenceMpMap : ClassMap<CompetenceMp>
//     {
//         public CompetenceMpMap()
//         {
//             Map(m => m.Matricule).Name("Matricule");
//             Map(m => m.Année).Name("Année");
//             Map(m => m.CompetenceName).Name("CompetenceName");
//             Map(m => m.Performance).Name("Performance");
//         }
//     }

//     // Classe de mapping pour IndicateurFo
//     public class IndicateurFoMap : ClassMap<IndicateurFo>
//     {
//         public IndicateurFoMap()
//         {
//             Map(m => m.Matricule).Name("Matricule");
//             Map(m => m.Année).Name("Année");
//             Map(m => m.Name).Name("Name");
//             Map(m => m.ResultText).Name("ResultText");
//             Map(m => m.Result).Name("Result");
//         }
//     }

//     // Classe de mapping pour IndicateurMp
//     public class IndicateurMpMap : ClassMap<IndicateurMp>
//     {
//         public IndicateurMpMap()
//         {
//             Map(m => m.Matricule).Name("Matricule");
//             Map(m => m.Année).Name("Année");
//             Map(m => m.Name).Name("Name");
//             Map(m => m.ResultText).Name("ResultText");
//             Map(m => m.Result).Name("Result");
//         }
//     }

//     // Classe de mapping pour IndicateurFi
//     public class IndicateurFiMap : ClassMap<IndicateurFi>
//     {
//         public IndicateurFiMap()
//         {
//             Map(m => m.Matricule).Name("Matricule");
//             Map(m => m.Année).Name("Année");
//             Map(m => m.Name).Name("Name");
//             Map(m => m.ResultText).Name("ResultText");
//             Map(m => m.Result).Name("Result");
//         }
//     }

//     // Classe de requête d'importation
//     public class ImportNonCadreEvaluationRequest
//     {
//         public IFormFile EvaluationFile { get; set; }
//         public IFormFile FixationFile { get; set; }
//         public IFormFile MiParcoursIndicatorsFile { get; set; }
//         public IFormFile MiParcoursCompetenceFile { get; set; }
//         public IFormFile FinaleFile { get; set; }
//     }

//     // Classes de données
//     public class PeriodDataNonCadre
//     {
//         public string Matricule { get; set; }
//         public int Année { get; set; }
//         public string Name { get; set; }
//         public string ResultText { get; set; }
//         public decimal Result { get; set; }
//     }

//     public class IndicateurFo : PeriodDataNonCadre { }
//     public class IndicateurMp : PeriodDataNonCadre { }
//     public class IndicateurFi : PeriodDataNonCadre { }

//     public class CompetenceMp
//     {
//         public string Matricule { get; set; }
//         public int Année { get; set; }
//         public string CompetenceName { get; set; }
//         public decimal Performance { get; set; }
//     }
// }

using CommonModels.DTOs;
using CsvHelper;
using CsvHelper.Configuration;
using EvaluationService.Data;
using EvaluationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Newtonsoft.Json;
using Microsoft.Extensions.Logging;

namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NonCadreImportController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly HttpClient _httpClient;
        private readonly ILogger<NonCadreImportController> _logger; // Injection du logger

        public NonCadreImportController(AppdbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<NonCadreImportController> logger)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri(configuration["UserService:BaseUrl"]);
            _logger = logger;
        }

        private async Task<List<UserDTO>> GetUsersFromExternalService()
        {
            var response = await _httpClient.GetAsync("/api/User/user");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to fetch users: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<UserDTO>>(content);
        }

        [HttpPost("import-non-cadre-evaluation")]
        public async Task<IActionResult> ImportNonCadreEvaluation([FromForm] ImportNonCadreEvaluationRequest request)
        {
            // Vérifiez la présence de tous les fichiers, y compris les nouveaux
            if (request.EvaluationFile == null || request.FixationFile == null || 
                request.MiParcoursIndicatorsFile == null || request.MiParcoursCompetenceFile == null || 
                request.FinaleFile == null || request.HelpFile == null || request.UserHelpContentFile == null)
            {
                _logger.LogWarning("Tentative d'importation avec des fichiers manquants.");
                return BadRequest("All seven files are required.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                _logger.LogInformation("Début de l'importation des données Non-Cadre.");

                // Étape 1 : Récupérer les utilisateurs via l'API externe
                var users = await GetUsersFromExternalService();

                // Étape 2 : Importer l'évaluation
                var evaluation = await ImportEvaluationData(request.EvaluationFile);
                if (evaluation.Type != "NonCadre")
                {
                    throw new Exception("Evaluation type must be NonCadre.");
                }

                _context.Evaluations.Add(evaluation);
                await _context.SaveChangesAsync();

                // Étape 3 : Importer les périodes
                var fixationData = await ImportPeriodData<IndicateurFo>(request.FixationFile);
                var miParcoursIndicatorsData = await ImportPeriodData<IndicateurMp>(request.MiParcoursIndicatorsFile);
                var miParcoursCompetenceData = await ImportPeriodData<CompetenceMp>(request.MiParcoursCompetenceFile);
                var finaleData = await ImportPeriodData<IndicateurFi>(request.FinaleFile);

                // Étape 4 : Préparer les ajouts des données historiques
                var userEvaluations = new List<UserEvaluation>();
                var historyFoList = new List<HistoryUserIndicatorFO>();
                var historyMpList = new List<HistoryUserIndicatorMP>();
                var historyCompetenceMpList = new List<HistoryUserCompetenceMP>();
                var historyFiList = new List<HistoryUserindicatorFi>();

                foreach (var userMatricule in fixationData.Select(d => d.Matricule).Distinct())
                {
                    var user = users.FirstOrDefault(u => u.Matricule == userMatricule);
                    if (user == null || user.TypeUser != "NonCadre")
                    {
                        throw new Exception($"No matching NonCadre user found for matricule: {userMatricule}");
                    }

                    var userEvaluation = new UserEvaluation
                    {
                        EvalId = evaluation.EvalId,
                        UserId = user.Id
                    };

                    userEvaluations.Add(userEvaluation);
                }

                _context.UserEvaluations.AddRange(userEvaluations);
                await _context.SaveChangesAsync();

                foreach (var userEval in userEvaluations)
                {
                    var matricule = users.First(u => u.Id == userEval.UserId).Matricule;

                    // Fixation Objectif
                    foreach (var data in fixationData.Where(d => d.Matricule == matricule))
                    {
                        var historyFo = new HistoryUserIndicatorFO
                        {
                            UserEvalId = userEval.UserEvalId,
                            Name = data.Name,
                            ResultText = data.ResultText,
                            Result = data.Result,
                            CreatedAt = DateTime.Now
                        };
                        historyFoList.Add(historyFo);
                    }

                    // Mi-Parcours - Indicateurs
                    foreach (var data in miParcoursIndicatorsData.Where(d => d.Matricule == matricule))
                    {
                        var historyMp = new HistoryUserIndicatorMP
                        {
                            UserEvalId = userEval.UserEvalId,
                            Name = data.Name,
                            ResultText = data.ResultText,
                            Result = data.Result
                        };
                        historyMpList.Add(historyMp);
                    }

                    // Mi-Parcours - Compétences
                    foreach (var data in miParcoursCompetenceData.Where(d => d.Matricule == matricule))
                    {
                        var historyCompetenceMp = new HistoryUserCompetenceMP
                        {
                            UserEvalId = userEval.UserEvalId,
                            CompetenceName = data.CompetenceName,
                            Performance = data.Performance
                        };
                        historyCompetenceMpList.Add(historyCompetenceMp);
                    }

                    // Finale
                    foreach (var data in finaleData.Where(d => d.Matricule == matricule))
                    {
                        var historyFi = new HistoryUserindicatorFi
                        {
                            UserEvalId = userEval.UserEvalId,
                            Name = data.Name,
                            ResultText = data.ResultText,
                            Result = data.Result,
                            CreatedAt = DateTime.Now
                        };
                        historyFiList.Add(historyFi);
                    }
                }

                // Ajout en masse des données historiques
                _context.HistoryUserIndicatorFOs.AddRange(historyFoList);
                _context.HistoryUserIndicatorMPs.AddRange(historyMpList);
                _context.HistoryUserCompetenceMPs.AddRange(historyCompetenceMpList);
                _context.HistoryUserindicatorFis.AddRange(historyFiList);

                // Sauvegarder toutes les modifications
                await _context.SaveChangesAsync();

                // Étape 5 : Importer les données Help
                var helpData = await ImportHelpData(request.HelpFile);
                _context.Helps.AddRange(helpData);
                await _context.SaveChangesAsync();

                // Étape 6 : Importer les données UserHelpContent
                var userHelpContentData = await ImportUserHelpContentData(request.UserHelpContentFile, helpData, users, evaluation);
                _context.UserHelpContents.AddRange(userHelpContentData);
                await _context.SaveChangesAsync();

                // Optionnel : Ajouter des enregistrements dans HistoryUserHelpContent
                var historyUserHelpContentData = userHelpContentData.Select(uhc => new HistoryUserHelpContent
                {
                    HelpId = uhc.HelpId,
                    HelpName = helpData.First(h => h.HelpId == uhc.HelpId).Name,
                    ContentId = uhc.ContentId,
                    UserEvalId = uhc.UserEvalId,
                    WriterUserId = uhc.WriterUserId,
                    Content = uhc.Content,
                    ArchivedAt = DateTime.UtcNow
                }).ToList();

                _context.HistoryUserHelpContents.AddRange(historyUserHelpContentData);
                await _context.SaveChangesAsync();

                // Étape 7 : Commit de la transaction
                await transaction.CommitAsync();
                _logger.LogInformation("Importation des données Non-Cadre réussie.");
                return Ok("Non-Cadre data imported successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erreur lors de l'importation des données Non-Cadre.");
                // En cas d'erreur, rollback de la transaction
                await transaction.RollbackAsync();
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        
        private async Task<Evaluation> ImportEvaluationData(IFormFile evaluationFile)
        {
            using var reader = new StreamReader(evaluationFile.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var evaluationData = csv.GetRecords<EvaluationData>().FirstOrDefault();
            if (evaluationData == null)
                throw new Exception("No evaluation data found.");

            var userEvaluationWeight = await _context.UserEvaluationWeights
            .FirstOrDefaultAsync(uwe => uwe.TemplateId == evaluationData.TemplateId);

            return new Evaluation
            {
                EvalAnnee = evaluationData.EvalAnnee,
                FixationObjectif = evaluationData.FixationObjectif,
                MiParcours = evaluationData.MiParcours,
                Final = evaluationData.Finale,
                EtatId = evaluationData.EtatId,
                TemplateId = evaluationData.TemplateId,
                Titre = evaluationData.Titre,
                Type = evaluationData.Type,
                CompetenceWeightTotal = userEvaluationWeight.CompetenceWeightTotal,
                IndicatorWeightTotal = userEvaluationWeight.IndicatorWeightTotal
            };
        }

        private async Task<List<T>> ImportPeriodData<T>(IFormFile file) where T : class
        {
            using var reader = new StreamReader(file.OpenReadStream());
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null, // Ignore les en-têtes manquants
                MissingFieldFound = null // Ignore les champs manquants
            };
            using var csv = new CsvReader(reader, config);

            // Appliquer le mapping personnalisé si défini
            if (typeof(T) == typeof(CompetenceMp))
            {
                csv.Context.RegisterClassMap<CompetenceMpMap>();
            }
            else if (typeof(T) == typeof(IndicateurFo))
            {
                csv.Context.RegisterClassMap<IndicateurFoMap>();
            }
            else if (typeof(T) == typeof(IndicateurMp))
            {
                csv.Context.RegisterClassMap<IndicateurMpMap>();
            }
            else if (typeof(T) == typeof(IndicateurFi))
            {
                csv.Context.RegisterClassMap<IndicateurFiMap>();
            }
            // Ajoutez d'autres mappings si nécessaire

            var records = new List<T>();
            int lineNumber = 1;

            while (await csv.ReadAsync())
            {
                var rawRecord = csv.Parser.Record;
                if (rawRecord == null || rawRecord.All(string.IsNullOrWhiteSpace))
                {
                    Console.WriteLine($"Skipping empty record at line {lineNumber}.");
                    lineNumber++;
                    continue;
                }

                try
                {
                    var record = csv.GetRecord<T>();
                    records.Add(record);
                }
                catch (Exception ex)
                {
                    throw new Exception($"Error parsing record at line {lineNumber}: {string.Join(", ", rawRecord)}. Details: {ex.Message}");
                }

                lineNumber++;
            }

            return records;
        }

        // La méthode InsertNonCadrePeriodData n'est plus nécessaire car les entités sont ajoutées en masse dans la méthode principale
        private async Task InsertNonCadrePeriodData(int userEvalId, List<IndicateurFo> fixationData, List<IndicateurMp> miParcoursIndicatorsData, List<CompetenceMp> miParcoursCompetenceData, List<IndicateurFi> finaleData, string matricule)
        {
            // Cette méthode est désormais intégrée directement dans la méthode principale
            // pour permettre un ajout en masse des entités
            await Task.CompletedTask;
        }

        private async Task<List<Help>> ImportHelpData(IFormFile helpFile)
        {
            using var reader = new StreamReader(helpFile.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = new List<Help>();
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                MissingFieldFound = null
            };
            csv.Context.RegisterClassMap<HelpMap>();

            try
            {
                records = csv.GetRecords<Help>().ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error parsing Help file: {ex.Message}");
            }

            // Validation ou transformation supplémentaire si nécessaire

            return records;
        }

        private async Task<List<UserHelpContent>> ImportUserHelpContentData(IFormFile userHelpContentFile, List<Help> helpData, List<UserDTO> users, Evaluation evaluation)
        {
            using var reader = new StreamReader(userHelpContentFile.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = new List<UserHelpContent>();
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HeaderValidated = null,
                MissingFieldFound = null
            };
            csv.Context.RegisterClassMap<UserHelpContentMap>();

            try
            {
                var rawRecords = csv.GetRecords<UserHelpContentCsv>().ToList();

                foreach (var raw in rawRecords)
                {
                    // Trouver l'utilisateur basé sur le Matricule
                    var user = users.FirstOrDefault(u => u.Matricule == raw.Matricule);
                    if (user == null)
                        throw new Exception($"Utilisateur non trouvé pour le matricule: {raw.Matricule}");

                    // Trouver l'évaluation correspondante
                    var userEval = await _context.UserEvaluations
                        .FirstOrDefaultAsync(ue => ue.UserId == user.Id && ue.Evaluation.EvalAnnee == raw.Année);
                    if (userEval == null)
                        throw new Exception($"Évaluation non trouvée pour l'utilisateur: {raw.Matricule} et l'année: {raw.Année}");

                    // Trouver le HelpId basé sur le nom
                    var help = helpData.FirstOrDefault(h => h.Name.Equals(raw.Help, StringComparison.OrdinalIgnoreCase));
                    if (help == null)
                        throw new Exception($"Help non trouvé pour le nom: {raw.Help}");

                    var userHelpContent = new UserHelpContent
                    {
                        UserEvalId = userEval.UserEvalId,
                        HelpId = help.HelpId,
                        WriterUserId = raw.Writer,
                        Content = raw.Content
                    };

                    records.Add(userHelpContent);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error parsing UserHelpContent file: {ex.Message}");
            }

            return records;
        }

    }

    // Classe de mapping pour CompetenceMp
    public class CompetenceMpMap : ClassMap<CompetenceMp>
    {
        public CompetenceMpMap()
        {
            Map(m => m.Matricule).Name("Matricule");
            Map(m => m.Année).Name("Année");
            Map(m => m.CompetenceName).Name("CompetenceName");
            Map(m => m.Performance).Name("Performance");
        }
    }

    // Classe de mapping pour IndicateurFo
    public class IndicateurFoMap : ClassMap<IndicateurFo>
    {
        public IndicateurFoMap()
        {
            Map(m => m.Matricule).Name("Matricule");
            Map(m => m.Année).Name("Année");
            Map(m => m.Name).Name("Name");
            Map(m => m.ResultText).Name("ResultText");
            Map(m => m.Result).Name("Result");
        }
    }

    // Classe de mapping pour IndicateurMp
    public class IndicateurMpMap : ClassMap<IndicateurMp>
    {
        public IndicateurMpMap()
        {
            Map(m => m.Matricule).Name("Matricule");
            Map(m => m.Année).Name("Année");
            Map(m => m.Name).Name("Name");
            Map(m => m.ResultText).Name("ResultText");
            Map(m => m.Result).Name("Result");
        }
    }

    // Classe de mapping pour IndicateurFi
    public class IndicateurFiMap : ClassMap<IndicateurFi>
    {
        public IndicateurFiMap()
        {
            Map(m => m.Matricule).Name("Matricule");
            Map(m => m.Année).Name("Année");
            Map(m => m.Name).Name("Name");
            Map(m => m.ResultText).Name("ResultText");
            Map(m => m.Result).Name("Result");
        }
    }

    // Classe de mapping pour Help
    public class HelpMap : ClassMap<Help>
    {
        public HelpMap()
        {
            Map(m => m.Name).Name("Name");
            Map(m => m.TemplateId).Name("TemplateId");
            Map(m => m.IsActive).Name("IsActive");
            Map(m => m.AllowedUserLevel).Name("AllowedUserLevel");
        }
    }

    // Classe représentant une ligne du CSV pour UserHelpContent
    public class UserHelpContentCsv
    {
        public string Matricule { get; set; }
        public int Année { get; set; }
        public string Help { get; set; }
        public string Writer { get; set; }
        public string Content { get; set; }
    }

    // Classe de mapping pour UserHelpContentCsv
    public class UserHelpContentMap : ClassMap<UserHelpContentCsv>
    {
        public UserHelpContentMap()
        {
            Map(m => m.Matricule).Name("Matricule");
            Map(m => m.Année).Name("Année");
            Map(m => m.Help).Name("Help");
            Map(m => m.Writer).Name("Writer");
            Map(m => m.Content).Name("Content");
        }
    }


    // Classe de requête d'importation
    public class ImportNonCadreEvaluationRequest
    {
        public IFormFile EvaluationFile { get; set; }
        public IFormFile FixationFile { get; set; }
        public IFormFile MiParcoursIndicatorsFile { get; set; }
        public IFormFile MiParcoursCompetenceFile { get; set; }
        public IFormFile FinaleFile { get; set; }

        public IFormFile HelpFile { get; set; }
        public IFormFile UserHelpContentFile { get; set; }
    }

    // Classes de données
    public class PeriodDataNonCadre
    {
        public string Matricule { get; set; }
        public int Année { get; set; }
        public string Name { get; set; }
        public string ResultText { get; set; }
        public decimal Result { get; set; }
    }

    public class IndicateurFo : PeriodDataNonCadre { }
    public class IndicateurMp : PeriodDataNonCadre { }
    public class IndicateurFi : PeriodDataNonCadre { }

    public class CompetenceMp
    {
        public string Matricule { get; set; }
        public int Année { get; set; }
        public string CompetenceName { get; set; }
        public decimal Performance { get; set; }
    }
}

