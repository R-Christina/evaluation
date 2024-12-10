using CommonModels.DTOs;
using CsvHelper;
using EvaluationService.Data;
using EvaluationService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Newtonsoft.Json;


namespace EvaluationService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImportController : ControllerBase
    {
        private readonly AppdbContext _context;
        private readonly HttpClient _httpClient;

        public ImportController(AppdbContext context, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient();
            _httpClient.BaseAddress = new Uri(configuration["UserService:BaseUrl"]);
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


        [HttpPost("import-evaluation")]
        public async Task<IActionResult> ImportEvaluation([FromForm] ImportEvaluationRequest request)
        {
            if (request.EvaluationFile == null || request.FixationFile == null || request.MiParcoursFile == null || request.FinaleFile == null)
            {
                return BadRequest("All four files are required.");
            }

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Étape 1 : Récupérer les utilisateurs via l'API externe
                var users = await GetUsersFromExternalService();

                // Étape 2 : Importer l'évaluation
                var evaluation = await ImportEvaluationData(request.EvaluationFile);

                _context.Evaluations.Add(evaluation);
                await _context.SaveChangesAsync();

                // Étape 3 : Importer les périodes
                var fixationData = await ImportPeriodData<FixationData>(request.FixationFile);
                var miParcoursData = await ImportPeriodData<MiParcoursData>(request.MiParcoursFile);
                var finaleData = await ImportPeriodData<FinaleData>(request.FinaleFile);

                // Étape 4 : Associer utilisateurs et insérer données historiques
                foreach (var userMatricule in fixationData.Select(d => d.Matricule).Distinct())
                {
                    // Trouver l'utilisateur correspondant au matricule
                    var user = users.FirstOrDefault(u => u.Matricule == userMatricule);
                    if (user == null || (evaluation.Type == "Cadre" && user.TypeUser != "Cadre"))
                    {
                        continue; // Ignorer si l'utilisateur n'est pas trouvé ou si le type ne correspond pas
                    }

                    var userEvaluation = new UserEvaluation
                    {
                        EvalId = evaluation.EvalId,
                        UserId = user.Id
                    };

                    _context.UserEvaluations.Add(userEvaluation);
                    await _context.SaveChangesAsync();

                    // Insérer les données de chaque période
                    await InsertPeriodData(userEvaluation.UserEvalId, fixationData, miParcoursData, finaleData, userMatricule);
                }


                await transaction.CommitAsync();
                return Ok("Data imported successfully.");
            }
            catch (Exception ex)
            {
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
                CompetenceWeightTotal = 0,
                IndicatorWeightTotal = 0

            };
        }

        private async Task<List<T>> ImportPeriodData<T>(IFormFile file) where T : PeriodData
        {
            using var reader = new StreamReader(file.OpenReadStream());
            using var csv = new CsvReader(reader, CultureInfo.InvariantCulture);

            var records = new List<T>();
            while (csv.Read())
            {
                var rawRecord = csv.Parser.Record;

                // Vérifier si toutes les colonnes sont vides
                if (rawRecord.All(string.IsNullOrWhiteSpace))
                {
                    Console.WriteLine("Skipping empty record.");
                    continue;
                }

                try
                {
                    var record = csv.GetRecord<T>();
                    records.Add(record);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error reading record: {string.Join(", ", rawRecord)}");
                    Console.WriteLine($"Error: {ex.Message}");
                }
            }

            return records;
        }




        private async Task InsertPeriodData(int userEvalId, List<FixationData> fixationData, List<MiParcoursData> miParcoursData, List<FinaleData> finaleData, string matricule)
        {
            // Fixation Objectif
            foreach (var data in fixationData.Where(d => d.Matricule == matricule))
            {
                var hcf = new HistoryCFo
                {
                    UserEvalId = userEvalId,
                    PriorityName = data.PriorityStrategique,
                    Description = data.Description,
                    Weighting = data.Ponderation,
                    ResultIndicator = data.IndicateurResultat,
                    CreatedAt = DateTime.Now
                };
                _context.HistoryCFos.Add(hcf);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(data.Commentaire))
                {
                    _context.HistoryObjectiveColumnValuesFos.Add(new HistoryObjectiveColumnValuesFo
                    {
                        HcfId = hcf.HcfId,
                        ColumnName = "Commentaire",
                        Value = data.Commentaire,
                        CreatedAt = DateTime.Now
                    });
                }
            }

            // Mi-Parcours
            foreach (var data in miParcoursData.Where(d => d.Matricule == matricule))
            {
                var hcm = new HistoryCMp
                {
                    UserEvalId = userEvalId,
                    PriorityName = data.PriorityStrategique,
                    Description = data.Description,
                    Weighting = data.Ponderation,
                    ResultIndicator = data.IndicateurResultat,
                    Result = data.Resultat,
                    UpdatedAt = DateTime.Now
                };
                _context.HistoryCMps.Add(hcm);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(data.Commentaire))
                {
                    _context.HistoryObjectiveColumnValuesMps.Add(new HistoryObjectiveColumnValuesMp
                    {
                        HcmId = hcm.HcmId,
                        ColumnName = "Commentaire",
                        Value = data.Commentaire,
                        CreatedAt = DateTime.Now
                    });
                }
            }

            // Finale
            foreach (var data in finaleData.Where(d => d.Matricule == matricule))
            {
                var hcfi = new HistoryCFi
                {
                    UserEvalId = userEvalId,
                    PriorityName = data.PriorityStrategique,
                    Description = data.Description,
                    Weighting = data.Ponderation,
                    ResultIndicator = data.IndicateurResultat,
                    Result = data.Resultat,
                    UpdatedAt = DateTime.Now
                };
                _context.HistoryCFis.Add(hcfi);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrEmpty(data.Commentaire))
                {
                    _context.HistoryObjectiveColumnValuesFis.Add(new HistoryObjectiveColumnValuesFi
                    {
                        HcfiId = hcfi.HcfiId,
                        ColumnName = "Commentaire",
                        Value = data.Commentaire,
                        CreatedAt = DateTime.Now
                    });
                }
            }
        }
    }

    // DTOs

    public class ImportEvaluationRequest
    {
        public IFormFile EvaluationFile { get; set; }
        public IFormFile FixationFile { get; set; }
        public IFormFile MiParcoursFile { get; set; }
        public IFormFile FinaleFile { get; set; }
    }

    public class EvaluationData
    {
        public int EvalAnnee { get; set; }
        public DateTime FixationObjectif { get; set; }
        public DateTime MiParcours { get; set; }
        public DateTime Finale { get; set; }
        public int EtatId { get; set; }
        public int TemplateId { get; set; }
        public string Titre { get; set; }   
        public string Type {get; set;}
    }

    public class PeriodData
    {
        public string Matricule { get; set; }
        public string PriorityStrategique { get; set; }
        public string Description { get; set; }
        public decimal Ponderation { get; set; }
        public string IndicateurResultat { get; set; }
        public decimal Resultat { get; set; }
        public string Commentaire { get; set; }
    }

    public class FixationData : PeriodData { }
    public class MiParcoursData : PeriodData { }
    public class FinaleData : PeriodData { }
}
