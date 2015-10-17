using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace CocaineCartels.BusinessLogic
{
    public sealed class Game
    {
        private static readonly Game SingletonInstance = new Game();

        static Game()
        { }

        private Game()
        {
            Board = new Board(Settings.GridSize);
            Players = new List<Player>();
        }

        public static Game Instance => SingletonInstance;

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        public Board Board { get; private set; }
        public readonly List<Player> Players;

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
