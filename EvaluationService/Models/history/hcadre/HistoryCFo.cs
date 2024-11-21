using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvaluationService.Models
{
    public class HistoryCFo
    {
        [Key]
        public int HcfId { get; set; }

        [ForeignKey("UserEvaluation")]
        public int UserEvalId { get; set; }

        [Required]
        [MaxLength(255)]
        public string PriorityName { get; set; }

        [Required]
        [MaxLength(255)]
        public string Description { get; set; }

        [Required]
        public decimal Weighting { get; set; }

        [Required]
        public string ValidatedBy {get; set;}

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        // Navigation property to UserEvaluations
        public virtual UserEvaluation UserEvaluation { get; set; }
    }
}