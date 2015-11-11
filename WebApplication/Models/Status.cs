using System.Collections.Generic;
using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class Status
    {
        public Status(IEnumerable<Player> players, int turnNumber)
        {
            Players = players;
            TurnNumber = turnNumber;
        }

        public IEnumerable<Player> Players { get; private set; }
        public int TurnNumber { get; private set; }
    }
}
