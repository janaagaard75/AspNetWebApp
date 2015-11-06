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

        /// <summary>1. The board from the previous turn, before any commands are executed, with all the new units besides the board.</summary>
        public Board PreviousTurn { get; private set; }

        /// <summary>2. The board from the previous turn, with all the new units placed on the board, but no move commands have been executed.</summary>
        public Board PreviousTurnShowingPlaceCommands { get; private set; }

        /// <summary>3. The board from the previous turn, with all move commands executed, but not combats resolved.</summary>
        public Board PreviousTurnShowingMoveCommands { get; private set; }

        /// <summary>4. The board for the current turn, with combats resolved and new units ready for each player.</summary>
        /// <remarks>Later on, this will also inlucde the player's planned moves, so that it's possible to refresh the page. Figure out what to do when copyging this to the previous turn.</remarks>
        public Board CurrentTurn { get; private set; }

        /// <summary>5. Player's commands for the next turn are assigned to this board. Private because it's not sent to the clients.</summary>
        private Board NextTurn { get; set; }

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
            Cell fromCell = NextTurn.GetCell(fromHex);
            Unit unit = fromCell.Units.FirstOrDefault(u => u.Player.Color == playerColor && u.MoveCommand == null);

            // If there wasn't an availble unit on the cell, check if a unit is to be placed on the cell.
            if (unit == null)
            {
                unit = NextTurn.NewUnits.First(u => u.Player.Color == playerColor && u.PlaceCommand != null && u.PlaceCommand.On == fromCell);
            }

            Cell toCell = NextTurn.GetCell(toHex);
            unit.SetMoveCommand(toCell);
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
            Hex ne = new Hex(CurrentTurn.GridSize, 0, -CurrentTurn.GridSize);
            Hex e = new Hex(CurrentTurn.GridSize, -CurrentTurn.GridSize, 0);
            Hex se = new Hex(0, -CurrentTurn.GridSize, CurrentTurn.GridSize);
            Hex sw = new Hex(-CurrentTurn.GridSize, 0, CurrentTurn.GridSize);
            Hex w = new Hex(-CurrentTurn.GridSize, CurrentTurn.GridSize, 0);
            Hex nw = new Hex(0, CurrentTurn.GridSize, -CurrentTurn.GridSize);

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

            Cell unitCell = CurrentTurn.GetCell(startingHex);

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
                CurrentTurn.NewUnits.Add(unit);
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
            IEnumerable<Unit> playersUnitsOnBoard = NextTurn.GetUnits().Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> playersNewUnits = CurrentTurn.NewUnits.Where(unit => unit.Player.Color == playerColor);
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

        /// <summary>Executes the commands, updating the boards. Resolves combats. Assigns new units.</summary>
        /// <remarks>All commands are stored on the NextTurn board. After each step of the turn the board is cloned to one for of the previous boards, which will allows the clients to show the different steps executed in the turn.</remarks>
        public void PerformTurn()
        {
            // NextTurn now becomes the previous turn.
            PreviousTurn = NextTurn.Clone();

            // Place all new units.
            var unitsToPlace = NextTurn.NewUnits.Where(newUnit => newUnit.PlaceCommand != null).ToList();
            unitsToPlace.ForEach(unit =>
            {
                NextTurn.NewUnits.Remove(unit);
                unit.PlaceCommand.On.AddUnit(unit);
                unit.RemovePlaceCommand();
            });
            PreviousTurnShowingPlaceCommands = NextTurn.Clone();

            // Move all the units.
            var unitsToMove = NextTurn.GetUnits().Where(unit => unit.MoveCommand != null).ToList();
            unitsToMove.ForEach(unit =>
            {
                unit.Cell.RemoveUnit(unit);
                unit.MoveCommand.To.AddUnit(unit);
                unit.RemoveMoveCommand();
            });
            PreviousTurnShowingMoveCommands = NextTurn.Clone();

            NextTurn.Fight();

            // Promote NextTurn to the current board and create copy of the board to the next board. Copying instead of assigning, because we want to be able to assign new commands.
            CurrentTurn = NextTurn.Clone();
            NextTurn = CurrentTurn.Clone();

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
            PreviousTurn = null;
            PreviousTurnShowingPlaceCommands = null;
            PreviousTurnShowingMoveCommands = null;
            CurrentTurn = new Board(Settings.GridSize);
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
            CurrentTurn.ResetNewUnits();
            NextTurn = CurrentTurn.Clone();
            Started = true;
        }
    }
}
