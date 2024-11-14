using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvaluationService.Models
{
    public class HistoryUserIndicatorFO
    {
        [Key]
        public int HistoryUserIndicatorFOId { get; set; }

        [ForeignKey("UserEvaluation")]
        [Required]
        public int UserEvalId { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        public string? ResultText { get; set; }

        public decimal? Result { get; set; }

        public virtual UserEvaluation UserEvaluation { get; set; }
    }
}