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
            ResetGame();
        }

        private readonly static Lazy<Game> _GameInstance = new Lazy<Game>(() => new Game());
        public static Game Instance => _GameInstance.Value;

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        private Board NextBoard { get; set; }

        public Board Board { get; private set; }
        public List<Unit> NewUnits { get; private set; }
        public List<Player> Players { get; private set; }
        public bool Started;

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new ApplicationException($"Cannot add more than {MaximumNumberOfPlayers} players to the game.");
            }

            Player player = new Player(PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(player);

            AddNewUnitsToPlayer(player, 1);

            return player;
        }

        /// <summary>Move the unit from the 
        /// 
        /// </summary>
        /// <param name="playerColor"></param>
        /// <param name="from"></param>
        /// <param name="to"></param>
        public void AddMoveCommand(string playerColor, Hex from, Hex to)
        {
            throw new NotImplementedException("TODO j");
        }

        /// <summary>Removed a unit from the player's stack of new units, put the unit on the specified cell and assign a place command to the unit.</summary>
        public void AddPlaceCommand(string playerColor, Hex onHex)
        {
            Unit unit = NewUnits.Single(u => u.Player.Color == playerColor);
            NewUnits.Remove(unit);
            Cell onCell = Board.GetCell(onHex);
            if (onCell.Units.All(u => u.Player.Color != playerColor))
            {
                throw new ApplicationException("Can only place new units on cells belonging to the player.");
            }

            onCell.AddUnit(unit);
            unit.SetPlaceCommand(onCell);
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

        private void AddNewUnitsToPlayer(Player player, int numberOfNewUnits)
        {
            for (int i = 0; i < numberOfNewUnits; i++)
            {
                var unit = new Unit(player);
                NewUnits.Add(unit);
            }
        }

        /// <summary>Remove all commands for the next turn that was assigned to the specified player.</summary>
        public void DeleteNextTurnCommands(string playerColor)
        {
            IEnumerable<Unit> playersUnitsOnBoard = NextBoard.GetUnits().Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> playersNewUnits = NewUnits.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> playersUnits = playersUnitsOnBoard.Concat(playersNewUnits);
            playersUnits.ForEach(unit =>
            {
                unit.RemoveCommands();
            });
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

        public void ResetGame()
        {
            Board = new Board(Settings.GridSize);
            NewUnits = new List<Unit>();
            Players = new List<Player>();
            Started = false;
        }

        public void StartGame()
        {
            if (Started)
            {
                throw new ApplicationException("The game is already started.");
            }

            for (int i = 0; i < NumberOfPlayers; i++)
            {
                Player player = Players[i];
                AddStartingUnitsToTheBoard(player, i, 3);
            }

            // Resetting the list of new units, since all players had a single new unit to show how many players where connected.
            NewUnits = new List<Unit>();

            NextBoard = Board.Copy();
            Started = true;
        }
    }
}
