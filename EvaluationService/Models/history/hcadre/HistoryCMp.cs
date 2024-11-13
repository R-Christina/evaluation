using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvaluationService.Models
{
    public class HistoryCMp
    {
        [Key]
        public int HcmId { get; set; }

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

        public string ResultIndicator { get; set; }

        [Required]
        public decimal Result { get; set; } = 0;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public virtual UserEvaluation UserEvaluation { get; set; }
    }
}