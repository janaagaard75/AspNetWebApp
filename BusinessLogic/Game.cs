using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace CocaineCartels.BusinessLogic
{
    public class Game
    {
        public Game()
        {
            Players = new List<Player>();
        }

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };
        public List<Player> Players { get; } 

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        public int NumberOfPlayers => Players.Count;

        public Player AddOrGetPlayer(IPAddress ipAddress, string userAgent)
        {
            Player matchingPlayer = Players.FirstOrDefault(player => player.IpAddress.Equals(ipAddress) && player.UserAgent == userAgent);

            if (matchingPlayer == null)
            {
                return AddPlayer(ipAddress, userAgent);
            }

            return matchingPlayer;
        }

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new NumberOfPlayersExceeded(MaximumNumberOfPlayers);
            }

            Player newPlayer = new Player(PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(newPlayer);

            return newPlayer;
        }
    }
}
