using System.ComponentModel.DataAnnotations;

namespace EvaluationService.Models
{
    public class ObjectiveColumn
    {
        [Key]
        public int ColumnId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; }

        [Required]
        public bool IsActive { get; set; } = true;

        public ICollection<ObjectiveColumnValue> ObjectiveColumnValues { get; set; }
    }
}