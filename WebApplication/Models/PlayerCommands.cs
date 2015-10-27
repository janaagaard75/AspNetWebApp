using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CocaineCartels.WebApplication.Models
{
    public class PlayerCommands
    {
        public IEnumerable<MoveCommand> MoveCommands { get; set; }
        public IEnumerable<PlaceCommand> PlaceCommands { get; set; }
        [Required]
        public string PlayerColor { get; set; }
    }
}
