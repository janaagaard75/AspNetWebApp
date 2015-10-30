using System.ComponentModel.DataAnnotations;
using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class PostHex
    {
        [Required]
        public int R { get; set; }
        [Required]
        public int S { get; set; }
        [Required]
        public int T { get; set; }

        public Hex ToHex()
        {
            return new Hex(R, S, T);
        }
    }
}
