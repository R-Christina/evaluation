using System.ComponentModel.DataAnnotations;

namespace EvaluationService.Models
{
    public class Help
    {
        [Key]
        public int HelpId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        public virtual ICollection<UserHelpContent> UserHelpContents { get; set; }
    }
}