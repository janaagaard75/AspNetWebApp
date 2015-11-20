using System.Collections.Generic;

namespace CocaineCartels.WebApplication.Models
{
    public class ClientCommands
    {
        public IEnumerable<ClientAllianceProposal> AllianceProposals { get; set; }
        public IEnumerable<ClientMoveCommand> MoveCommands { get; set; }
        public IEnumerable<ClientPlaceCommand> PlaceCommands { get; set; }
    }
}
