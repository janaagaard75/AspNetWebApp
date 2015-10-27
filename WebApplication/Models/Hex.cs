using System.ComponentModel.DataAnnotations;

namespace CocaineCartels.WebApplication.Models
{
    public class Hex
    {
        [Required]
        public int R { get; set; }
        [Required]
        public int S { get; set; }
        [Required]
        public int T { get; set; }
    }
}
