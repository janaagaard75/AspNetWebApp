using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CocaineCartels.WebApplication.Models
{
    public class PostCommands
    {
        public IEnumerable<PostMoveCommand> MoveCommands { get; set; }
        public IEnumerable<PostPlaceCommand> PlaceCommands { get; set; }
        [Required]
        public string PlayerColor { get; set; }
    }
}
