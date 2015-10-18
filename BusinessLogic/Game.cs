using System.Collections.Generic;
using System.Linq;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public sealed class Game
    {
        [JsonIgnore]
        public static Game Instance { get; } = new Game();

        private Game()
        {
            Board = new Board(Settings.GridSize);
            Players = new List<Player>();
        }

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        public readonly Board Board;
        public readonly List<Player> Players;

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        /// <exception cref="NumberOfPlayersExceeded"></exception>
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

        /// <summary>Returns the player matching the IP address and the user agent string. If no players a found, a player will be created.</summary>
        /// <exception cref="NumberOfPlayersExceeded">Thrown if the player is not found and the maximum number of players has already been reached.</exception>
        public Player GetPlayer(IPAddress ipAddress, string userAgent)
        {
            Player matchingPlayer = Players.FirstOrDefault(player => player.IpAddress.Equals(ipAddress) && player.UserAgent == userAgent);

            if (matchingPlayer == null)
            {
                return AddPlayer(ipAddress, userAgent);
            }

            return matchingPlayer;
        }
    }
}

// TODO: Try to implement this lazy instation. It should be more thread-safe.
// http://www.asp.net/signalr/overview/getting-started/tutorial-server-broadcast-with-signalr
//private readonly static Lazy<StockTicker> _instance = new Lazy<StockTicker>(() => new StockTicker(GlobalHost.ConnectionManager.GetHubContext<StockTickerHub>().Clients));

//public static StockTicker Instance
//{
//    get
//    {
//        return _instance.Value;
//    }
//}