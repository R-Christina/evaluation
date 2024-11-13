using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace UserService.Models
{
    public enum EmployeeType
    {
        Cadre,
        NonCadre
    }

    public class User
    {
        [Key]
        public string Id { get; set; }              
        public string Name { get; set; }            
        public string Email { get; set; }           
        public string? Poste { get; set; }           
        public string? Department { get; set; }      
        public string? SuperiorId { get; set; }      
        public string? SuperiorName { get; set; }
        public string? Status { get; set; }
        
        public EmployeeType? TypeUser { get; set; }
        public List<Habilitation> Habilitations { get; set; }
    }
}