using System.Collections.Generic;
using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class Status
    {
        public Status(Player currentPlayer, IEnumerable<Player> players, int turnNumber)
        {
            CurrentPlayer = currentPlayer;
            Players = players;
            TurnNumber = turnNumber;
        }

        public Player CurrentPlayer { get; }
        public IEnumerable<Player> Players { get; }
        public int TurnNumber { get; }
    }
}
