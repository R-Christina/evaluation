using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvaluationService.Models
{
    public class HistoryUserIndicatorMP
    {
        [Key]
        public int HistoryUserIndicatorMPId { get; set; }

        [ForeignKey("UserEvaluation")]
        [Required]
        public int UserEvalId { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }
        
        [Required]
        public string ResultText { get; set; }

        [Required]
        public decimal Result { get; set; }

        public virtual UserEvaluation UserEvaluation { get; set; }
    }
}