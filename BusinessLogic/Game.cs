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

        private static readonly Lazy<Game> _GameInstance = new Lazy<Game>(() => new Game());
        public static Game Instance => _GameInstance.Value;

        private readonly string[] PlayerColors = { "#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f" };

        private int MaximumNumberOfPlayers => PlayerColors.Length;
        private int NumberOfPlayers => Players.Count;

        // The next board will only become necessary once the game will be able to show the commands from the previous turn.
        private Board NextBoard { get; set; }

        public Board Board { get; private set; }
        public List<Player> Players { get; private set; }
        public bool Started;

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new ApplicationException($"Cannot add more than {MaximumNumberOfPlayers} players to the game.");
            }

            bool administrator = NumberOfPlayers == 0; // The first player to join becomes the administrator.
            Player player = new Player(administrator, PlayerColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(player);

            AddNewUnitsToPlayer(player, 1);

            return player;
        }

        /// <summary>Assign a move command to a unit. The unit is not moved. Units to be placed on the from cell are also candidates for the move command.</summary>
        public void AddMoveCommand(string playerColor, Hex fromHex, Hex toHex)
        {
            Cell fromCell = NextBoard.GetCell(fromHex);
            Unit unit = fromCell.Units.FirstOrDefault(u => u.Player.Color == playerColor && u.MoveCommand == null);
            if (unit == null)
            {
                unit = Board.NewUnits.First(u => u.Player.Color == playerColor && u.PlaceCommand != null && u.PlaceCommand.On == fromCell);
            }

            Cell toCell = NextBoard.GetCell(toHex);
            unit.SetMoveCommand(toCell);
        }

        /// <summary>Assign a place command to a unit. The unit is not moved to the cell.</summary>
        public void AddPlaceCommand(string playerColor, Hex onHex)
        {
            Unit unit = Board.NewUnits.First(u => u.Player.Color == playerColor && u.PlaceCommand == null);
            Cell onCell = NextBoard.GetCell(onHex);
            unit.SetPlaceCommand(onCell);
        }

        private void AddStartingUnitsToTheBoard(Player player, int playerNumber, int numberOfUnits, int numberOfPlayers)
        {
            Hex ne = new Hex(Board.GridSize, 0, -Board.GridSize);
            Hex e = new Hex(Board.GridSize, -Board.GridSize, 0);
            Hex se = new Hex(0, -Board.GridSize, Board.GridSize);
            Hex sw = new Hex(-Board.GridSize, 0, Board.GridSize);
            Hex w = new Hex(-Board.GridSize, Board.GridSize, 0);
            Hex nw = new Hex(0, Board.GridSize, -Board.GridSize);

            Hex startingHex;
            switch (playerNumber)
            {
                case 0:
                    startingHex = ne;
                    break;

                case 1:
                    switch (numberOfPlayers)
                    {
                        case 2:
                            startingHex = sw;
                            break;
                        case 3:
                        case 4:
                            startingHex = se;
                            break;

                        default:
                            startingHex = e;
                            break;
                    }
                    break;

                case 2:
                    switch (numberOfPlayers)
                    {
                        case 3:
                            startingHex = w;
                            break;

                        case 4:
                            startingHex = sw;
                            break;

                        default:
                            startingHex = se;
                            break;
                    }
                    break;

                case 3:
                    switch (numberOfPlayers)
                    {
                        case 4:
                            startingHex = nw;
                            break;

                        default:
                            startingHex = sw;
                            break;
                    }
                    break;

                case 4:
                    startingHex = w;
                    break;

                case 5:
                    startingHex = nw;
                    break;

                default:
                    throw new ApplicationException("Only supports up to 6 players.");
            }

            Cell unitCell = Board.GetCell(startingHex);

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
                Board.NewUnits.Add(unit);
            }
        }

        private void AddPointsToPlayer(Player player)
        {
            int pointsThisTurn = player.NumberOfCells();
            player.Points += pointsThisTurn;
        }

        /// <summary>Remove all commands for the next turn that was assigned to the specified player.</summary>
        public void DeleteNextTurnCommands(string playerColor)
        {
            IEnumerable<Unit> playersUnitsOnBoard = NextBoard.GetUnits().Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> playersNewUnits = Board.NewUnits.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> playersUnits = playersUnitsOnBoard.Concat(playersNewUnits);
            playersUnits.ForEach(unit =>
            {
                unit.RemoveCommands();
            });
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

        /// <summary>Executes the commands. Resolves combats. Assigns new units.</summary>
        public void PerformTurn()
        {
            // Assume that all players have sent in their commands.

            // Place all new units.
            var unitsToPlace = Board.NewUnits.Where(newUnit => newUnit.PlaceCommand != null).ToList();
            unitsToPlace.ForEach(unit =>
            {
                Board.NewUnits.Remove(unit);
                unit.PlaceCommand.On.AddUnit(unit);
                unit.RemovePlaceCommand();
            });

            // Move all the units.
            var unitsToMove = NextBoard.GetUnits().Where(unit => unit.MoveCommand != null).ToList();
            unitsToMove.ForEach(unit =>
            {
                unit.Cell.RemoveUnit(unit);
                unit.MoveCommand.To.AddUnit(unit);
                unit.RemoveMoveCommand();
            });

            NextBoard.Fight();

            // Promote NextBoard to the current board and create copy of the board to the next board. Copying instead of assigning, because we want to be able to assign new commands.
            Board = NextBoard;
            NextBoard = Board.Copy();

            // Assign new units to the players.
            Players.ForEach(player =>
            {
                AddPointsToPlayer(player);

                int newUnitsThisTurn = Settings.NewUnitsPerTurn;
                // ReSharper disable once ConditionIsAlwaysTrueOrFalse
                if (Settings.NewUnitPerCellsControlled != 0)
                {
                    newUnitsThisTurn += player.NumberOfCells() / Settings.NewUnitPerCellsControlled;
                }

                AddNewUnitsToPlayer(player, newUnitsThisTurn);
                player.Ready = false;
            });
        }

        public void ResetGame()
        {
            Board = new Board(Settings.GridSize);
            Players = new List<Player>();
            Started = false;
        }

        public void SetPlayerReady(string playerColor)
        {
            Players.Where(player => player.Color == playerColor).ForEach(player =>
            {
                player.Ready = true;
            });
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
                AddStartingUnitsToTheBoard(player, i, Settings.NumberOfStartingUnits, NumberOfPlayers);
            }

            // Resetting the list of new units, since all players had a single new unit to show how many players where connected.
            Board.ResetNewUnits();
            NextBoard = Board.Copy();
            Started = true;
        }
    }
}
