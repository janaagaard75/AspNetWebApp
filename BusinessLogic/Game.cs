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
            NewUnits = new List<Unit>();
            Players = new List<Player>();
        }

        private readonly static Lazy<Game> _GameInstance = new Lazy<Game>(() => new Game());
        public static Game Instance => _GameInstance.Value;

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        private Board NextBoard { get; set; }

        public Board Board { get; private set; }
        public List<Unit> NewUnits { get; }
        public List<Player> Players { get; }

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new NumberOfPlayersExceeded(MaximumNumberOfPlayers);
            }

            Player player = new Player(PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(player);

            // TODO j: Trigger this by calling start game instead.
            StartGame();

            return player;
        }

        public void AddMoveCommand(Player player, Hex from, Hex to)
        {
            // TODO j: Add the move command to the next board.
        }

        public void AddPlaceCommand(Player player, Hex on)
        {
            // TODO j: Add the place command to the next board.
        }

        private void AddStartingUnitsToTheBoard(Player player, int playerNumber, int numberOfUnits)
        {
            Hex unitHex;
            switch (playerNumber)
            {
                case 0:
                    unitHex = new Hex(Board.GridSize, 0, -Board.GridSize);
                    break;

                case 1:
                    unitHex = new Hex(Board.GridSize, -Board.GridSize, 0);
                    break;

                case 2:
                    unitHex = new Hex(0, -Board.GridSize, Board.GridSize);
                    break;

                case 3:
                    unitHex = new Hex(-Board.GridSize, 0, Board.GridSize);
                    break;

                case 4:
                    unitHex = new Hex(-Board.GridSize, Board.GridSize, 0);
                    break;

                case 5:
                    unitHex = new Hex(0, Board.GridSize, -Board.GridSize);
                    break;

                default:
                    throw new ApplicationException("Only supports up to 6 players.");
            }

            Cell unitCell = Board.GetCell(unitHex);

            for (int i = 0; i < numberOfUnits; i++)
            {
                Unit unit = new Unit(player);
                unitCell.AddUnit(unit);
            }
        }

        private void AssignNewUnitsToPlayer(Player player, int numberOfNewUnits)
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

        public void StartGame()
        {
            for (int i = 0; i < NumberOfPlayers; i++)
            {
                Player player = Players[i];
                AddStartingUnitsToTheBoard(player, NumberOfPlayers, 3);
                AssignNewUnitsToPlayer(player, 3);
            }

            NextBoard = Board.Copy();
        }

        public void ExecuteCommands()
        {
            // Execution phase of the turn.
            // Assume that all players have sent in their commands.
            // Perform all the commands assigned to the units on the NextBoard.
            
            // Promote NextBoard to the current board.
            Board = NextBoard;

            // Clone Board in the NextBoard. Not using a reference here because we want to be able to assign 
            NextBoard = Board.Copy();

            // TODO j: Assign new units on all the players.
            Players.ForEach(player =>
            {
                
            });

            //NewUnits = 
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