using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace CocaineCartels.BusinessLogic
{
    public sealed class Game
    {
        private Game()
        {
            Board = new Board(Settings.GridSize);
            Players = new List<Player>();
        }

        private readonly static Lazy<Game> _GameInstance = new Lazy<Game>(() => new Game());
        public static Game Instance => _GameInstance.Value;

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        public readonly Board Board;
        public readonly List<Player> Players;

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new NumberOfPlayersExceeded(MaximumNumberOfPlayers);
            }

            Player newPlayer = new Player(PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(newPlayer);

            AddPlayerToBoard(newPlayer, NumberOfPlayers);

            return newPlayer;
        }

        private void AddPlayerToBoard(Player player, int playerNumber)
        {
            Hex hex = null;
            switch (playerNumber)
            {
                case 0:
                    hex = new Hex(Board.GridSize, 0, -Board.GridSize);
                    break;

                case 1:
                    hex = new Hex(Board.GridSize, -Board.GridSize, 0);
                    break;

                case 2:
                    hex = new Hex(0, -Board.GridSize, Board.GridSize);
                    break;

                case 3:
                    hex = new Hex(-Board.GridSize, 0, Board.GridSize);
                    break;

                case 4:
                    hex = new Hex(-Board.GridSize, Board.GridSize, 0);
                    break;

                case 5:
                    hex = new Hex(0, Board.GridSize, -Board.GridSize);
                    break;
            }

            if (hex == null)
            {
                return;
            }

            Cell cell = Board.GetCell(hex);
            Unit unit = new Unit(player);
            cell.AddUnit(unit);
        }

        /// <summary>Returns the player matching the IP address and the user agent string. If no players a found, a player will be created.</summary>
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