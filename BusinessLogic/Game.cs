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
            _Board = new Board(Settings.GridSize);
            _NewUnits = new List<Unit>();
            _Players = new List<Player>();
        }

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        private readonly static Lazy<Game> _GameInstance = new Lazy<Game>(() => new Game());

        private readonly Board _Board;
        private readonly List<Unit> _NewUnits;
        private readonly List<Player> _Players;

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        public static Game Instance => _GameInstance.Value;

        public Board Board => Instance._Board;
        public List<Unit> NewUnits => Instance._NewUnits;
        public List<Player> Players => Instance._Players;

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new NumberOfPlayersExceeded(MaximumNumberOfPlayers);
            }

            Player player = new Player(PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(player);

            // TODO j: Move this somewhere else - it's demo initialization data.
            AddAUnitToTheBoard(player, NumberOfPlayers);
            AssignNewUnitsToPlayer(3, player);

            return player;
        }

        private void AddAUnitToTheBoard(Player player, int playerNumber)
        {
            Hex unitHex = null;
            Hex moveToHex = null;
            switch (playerNumber)
            {
                case 0:
                    unitHex = new Hex(Board.GridSize, 0, -Board.GridSize);
                    moveToHex = new Hex(Board.GridSize - 1, 0, -(Board.GridSize - 1));
                    break;

                case 1:
                    unitHex = new Hex(Board.GridSize, -Board.GridSize, 0);
                    moveToHex = new Hex(Board.GridSize - 1, -(Board.GridSize - 1), 0);
                    break;

                case 2:
                    unitHex = new Hex(0, -Board.GridSize, Board.GridSize);
                    moveToHex = new Hex(0, -(Board.GridSize - 1), Board.GridSize - 1);
                    break;

                case 3:
                    unitHex = new Hex(-Board.GridSize, 0, Board.GridSize);
                    moveToHex = new Hex(-(Board.GridSize - 1), 0, Board.GridSize - 1);
                    break;

                case 4:
                    unitHex = new Hex(-Board.GridSize, Board.GridSize, 0);
                    moveToHex = new Hex(Board.GridSize - 1, -(Board.GridSize - 1), 0);
                    break;

                case 5:
                    unitHex = new Hex(0, Board.GridSize, -Board.GridSize);
                    moveToHex = new Hex(0, Board.GridSize - 1, -(Board.GridSize - 1));
                    break;
            }

            if (unitHex == null)
            {
                return;
            }

            Cell unitCell = Board.GetCell(unitHex);
            Unit unit = new Unit(player);
            unitCell.AddUnit(unit);
            Cell moveToCell = Board.GetCell(moveToHex);
            unit.SetMoveCommand(moveToCell);
        }

        private void AssignNewUnitsToPlayer(int numberOfNewUnits, Player player)
        {
            for (int i = 0; i < numberOfNewUnits; i++)
            {
                var unit = new Unit(player);
                NewUnits.Add(unit);
            }
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