using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CocaineCartels.WebApplication.Models
{
    public class ClientCommands
    {
        public IEnumerable<ClientMoveCommand> MoveCommands { get; set; }
        public IEnumerable<ClientPlaceCommand> PlaceCommands { get; set; }
        [Required]
        public string PlayerColor { get; set; }
    }
}
