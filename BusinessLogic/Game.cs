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

        private readonly PlayerColors[] PlayersColors =
        {
            new PlayerColors("#f00", "#fff"),
            new PlayerColors("#ff0", "#000"),
            new PlayerColors("#0f0", "#000"),
            new PlayerColors("#0ff", "#000"),
            new PlayerColors("#00f", "#fff"),
            new PlayerColors("#f0f", "#fff")
        };

        private int MaximumNumberOfPlayers => PlayersColors.Length;
        private int NumberOfPlayers => Players.Count;

        /// <summary>The board from the previous turn, before any commands are executed, with all the new units besides the board. This was how the board looked when the previous turn started.</summary>
        public Board PreviousTurn { get; private set; }

        /// <summary>The board from the previous turn, with all the new units placed on the board, but no move commands have been executed. This board is <see cref="PreviousTurn"/> with place commands executed.</summary>
        public Board PreviousTurnShowingPlaceCommands { get; private set; }

        /// <summary>The board from the previous turn, with all move commands executed, but not combats resolved. This board is <see cref="PreviousTurnShowingPlaceCommands"/> with move commands executed.</summary>
        public Board PreviousTurnShowingMoveCommands { get; private set; }

        /// <summary>This board is the one used to store the player's commands for the next turn. It's <see cref="PreviousTurnShowingMoveCommands"/> with combat resolved.</summary>
        private Board NextTurn { get; set; }

        public List<Player> Players { get; private set; }
        public bool Started { get; private set; }
        public int TurnNumber { get; private set; }

        private Player AddPlayer(IPAddress ipAddress, string userAgent)
        {
            if (NumberOfPlayers == MaximumNumberOfPlayers)
            {
                throw new ApplicationException($"Cannot add more than {MaximumNumberOfPlayers} players to the game.");
            }

            bool administrator = NumberOfPlayers == 0; // The first player to join becomes the administrator.
            Player player = new Player(administrator, PlayersColors[NumberOfPlayers], ipAddress, userAgent);
            Players.Add(player);

            return player;
        }

        /// <summary>Assign a move command to a unit. The unit is not moved. Units to be placed on the from cell are also candidates for the move command.</summary>
        public void AddMoveCommand(string playerColor, Hex fromHex, Hex toHex)
        {
            Cell fromCell = NextTurn.GetCell(fromHex);
            Unit unit = fromCell.Units.FirstOrDefault(u => u.Player.Color == playerColor && u.MoveCommand == null);

            // If there wasn't an availble unit on the cell, check if a unit is to be placed on the cell.
            if (unit == null)
            {
                unit = NextTurn.NewUnits.First(u => u.Player.Color == playerColor && u.PlaceCommand != null && u.PlaceCommand.On == fromCell);
            }

            Cell toCell = NextTurn.GetCell(toHex);
            unit.SetMoveCommand(fromCell, toCell);
        }

        /// <summary>Assign a place command to a unit. The unit is not moved to the cell.</summary>
        public void AddPlaceCommand(string playerColor, Hex onHex)
        {
            Unit unit = NextTurn.NewUnits.First(u => u.Player.Color == playerColor && u.PlaceCommand == null);
            Cell onCell = NextTurn.GetCell(onHex);
            unit.SetPlaceCommand(onCell);
        }

        private void AddStartingUnitsToTheBoard(Player player, int playerNumber, int numberOfUnits, int numberOfPlayers)
        {
            Hex ne = new Hex(NextTurn.GridSize, 0, -NextTurn.GridSize);
            Hex e = new Hex(NextTurn.GridSize, -NextTurn.GridSize, 0);
            Hex se = new Hex(0, -NextTurn.GridSize, NextTurn.GridSize);
            Hex sw = new Hex(-NextTurn.GridSize, 0, NextTurn.GridSize);
            Hex w = new Hex(-NextTurn.GridSize, NextTurn.GridSize, 0);
            Hex nw = new Hex(0, NextTurn.GridSize, -NextTurn.GridSize);

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

            Cell unitCell = NextTurn.GetCell(startingHex);

            for (int i = 0; i < numberOfUnits; i++)
            {
                Unit unit = new Unit(player);
                unitCell.AddUnit(unit);
            }
        }

        private void AddPointsToPlayer(Player player)
        {
            int pointsThisTurn = NextTurn.NumberOfControlledCells(player);
            player.Points += pointsThisTurn;
        }

        /// <summary>Returns the NextTurn board, but only with the specified player's commands.</summary>
        public Board GetCurrentTurn(Player player)
        {
            var currentTurn = NextTurn.Clone();

            currentTurn.UnitsOnCells.ForEach(unit =>
            {
                if (!unit.Player.Equals(player))
                {
                    unit.RemoveMoveCommand();
                }
            });

            currentTurn.NewUnits.ForEach(unit =>
            {
                if (!unit.Player.Equals(player))
                {
                    unit.RemovePlaceCommand();
                }
            });

            return currentTurn;
        }

        private int GetNumberOfNewUnitsForPlayer(Player player)
        {
            int newUnitsThisTurn = Settings.NewUnitsPerTurn;
            // ReSharper disable once ConditionIsAlwaysTrueOrFalse
            if (Settings.NewUnitPerCellsControlled != 0)
            {
                newUnitsThisTurn += NextTurn.NumberOfControlledCells(player) / Settings.NewUnitPerCellsControlled;
            }

            return newUnitsThisTurn;
        }

        /// <summary>Remove all commands for the next turn that was assigned to the specified player.</summary>
        public void DeleteNextTurnCommands(string playerColor)
        {
            IEnumerable<Unit> unitsOnBoard = NextTurn.UnitsOnCells.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> newUnits = NextTurn.NewUnits.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> units = unitsOnBoard.Concat(newUnits);
            units.ForEach(unit =>
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

        /// <summary>Executes the commands, updating the boards. Resolves combats. Assigns new units.</summary>
        /// <remarks>All commands are stored on the NextTurn board. After each step of the turn the board is cloned to one for of the previous boards, which will allows the clients to show the different steps executed in the turn.</remarks>
        public void PerformTurn()
        {
            // NextTurn now becomes the previous turn.
            PreviousTurn = NextTurn.Clone();

            // Remove all the commands on the previous turn board.
            PreviousTurn.AllUnits.ForEach(unit =>
            {
                unit.RemoveCommands();
            });

            // Place all new units, removing the place commands.
            var unitsToPlace = NextTurn.NewUnits.Where(newUnit => newUnit.PlaceCommand != null).ToList();
            unitsToPlace.ForEach(unit =>
            {
                NextTurn.NewUnits.Remove(unit);
                unit.PlaceCommand.On.AddUnit(unit);
                unit.RemovePlaceCommand();
            });
            PreviousTurnShowingPlaceCommands = NextTurn.Clone();

            // Remove all the move commands on the board showing where the units have been placed.
            PreviousTurnShowingPlaceCommands.AllUnits.ForEach(unit =>
            {
                unit.RemoveMoveCommand();
            });

            // Move all the units, keeping the move commands.
            var unitsToMove = NextTurn.UnitsOnCells.Where(unit => unit.MoveCommand != null).ToList();
            unitsToMove.ForEach(unit =>
            {
                unit.Cell.RemoveUnit(unit);
                unit.MoveCommand.To.AddUnit(unit);
            });
            PreviousTurnShowingMoveCommands = NextTurn.Clone();

            // Remove the move commands on the final board.
            NextTurn.UnitsOnCells.ForEach(unit =>
            {
                unit.RemoveMoveCommand();
            });

            NextTurn.Fight();

            // Assign new units to the players, add points to them and set their ready state to false.
            Players.ForEach(player =>
            {
                NextTurn.AddNewUnitsToPlayer(player, GetNumberOfNewUnitsForPlayer(player));
                AddPointsToPlayer(player);
                player.CommandsSentOn = null;
                player.Ready = false;
            });

            TurnNumber++;
        }

        public void ResetGame()
        {
            PreviousTurn = null;
            PreviousTurnShowingPlaceCommands = null;
            PreviousTurnShowingMoveCommands = null;
            NextTurn = new Board(Settings.GridSize);
            Players = new List<Player>();
            Started = false;
            TurnNumber = 1;
        }

        public void SetPlayerReadyStatus(string playerColor, bool isReady)
        {
            Players.Where(player => player.Color == playerColor).ForEach(player =>
            {
                player.Ready = isReady;
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

            Started = true;
        }

        public void UpdateCommandsSentOn(string playerColor)
        {
            Players.Single(player => player.Color == playerColor).CommandsSentOn = DateTime.UtcNow;
        }
    }
}
