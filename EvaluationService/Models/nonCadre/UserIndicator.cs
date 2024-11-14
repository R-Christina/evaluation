using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EvaluationService.Models
{
    public class UserIndicator
    {
        [Key]
        public int UserIndicatorId { get; set; }

        [Required]
        public int UserEvalId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        // Foreign Key to Indicator
        [Required]
        public int IndicatorId { get; set; }

        // Navigation Property to Indicator
        [ForeignKey("IndicatorId")]
        public virtual Indicator Indicator { get; set; }

        // Foreign Key and Navigation Property for UserEvaluation
        [ForeignKey("UserEvalId")]
        public virtual UserEvaluation UserEvaluation { get; set; }

        public virtual ICollection<UserIndicatorResult> UserIndicatorResults { get; set; }
    }
}
