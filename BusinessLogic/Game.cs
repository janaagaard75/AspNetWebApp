using System;
using System.Collections.Generic;
using System.Linq;
using CocaineCartels.BusinessLogic.Exceptions;
using CocaineCartels.BusinessLogic.Extensions;

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

        private readonly PlayerData[] PlayersData =
        {
            new PlayerData("#f22", "Red"),
            new PlayerData("#cc0", "Yellow"),
            new PlayerData("#0b0", "Green"),
            new PlayerData("#07e", "Magenta"),
            new PlayerData("#84f", "Blue"),
            new PlayerData("#f0f", "Cyan")
        };

        private readonly object AddPlayerLock = new object();
        private readonly object SetAllPlayersSeemToBeHereLock = new object();
        private readonly object StartGameLock = new object();
        private readonly object TurnLock = new object();

        public int GridSize { get; set; }

        /// <summary>The board containing the previous turn. New units are placed on the cells and have the newUnit flag set to true. Units aren't moved, but have move commands. Units that died in combat have the killed flag set to true.</summary>
        public Turn PreviousTurn { get; private set; }

        /// <summary>This board is the one used to store the player's commands for the next turn.</summary>
        private Turn NextTurn { get; set; }

        public List<Player> Players { get; private set; }

        private int MaximumNumberOfPlayers => PlayersData.Length;
        private int NumberOfPlayers => Players.Count;
        public bool Started => TurnNumber > 0;
        public int TurnNumber => NextTurn.TurnNumber;

        private Player AddPlayer(Guid id)
        {
            lock (AddPlayerLock)
            {
                if (NumberOfPlayers == MaximumNumberOfPlayers)
                {
                    throw new TooManyPlayersException(MaximumNumberOfPlayers);
                }

                if (Started)
                {
                    throw new GameStartedException();
                }

                Player player = new Player(id, PlayersData[NumberOfPlayers].Color, PlayersData[NumberOfPlayers].Name, NumberOfPlayers);
                Players.Add(player);

                return player;
            }
        }

        public void AddAllianceProposal(string fromPlayerColor, string toPlayerColor)
        {
            Player fromPlayer = GetPlayer(fromPlayerColor);
            Player toPlayer = GetPlayer(toPlayerColor);
            AllianceProposal allianceProposal = new AllianceProposal(fromPlayer, toPlayer);
            NextTurn.AllianceProposals.Add(allianceProposal);
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
            Hex ne = new Hex(GridSize, 0, -GridSize);
            Hex e = new Hex(GridSize, -GridSize, 0);
            Hex se = new Hex(0, -GridSize, GridSize);
            Hex sw = new Hex(-GridSize, 0, GridSize);
            Hex w = new Hex(-GridSize, GridSize, 0);
            Hex nw = new Hex(0, GridSize, -GridSize);

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
            player.PointsLastTurn = NextTurn.NumberOfControlledCells(player);
            player.Points += player.PointsLastTurn;
        }

        /// <summary>Returns the NextTurn board, but only with the specified player's commands.</summary>
        public Turn GetCurrentTurn(Player player)
        {
            var currentTurn = NextTurn.Clone();

            var playersUnitsOnCells = currentTurn.UnitsOnCells.Where(unit => unit.Player.Color != player.Color);
            foreach (var unit in playersUnitsOnCells)
            {
                unit.RemoveMoveCommand();
            }

            var playersNewUnits = currentTurn.NewUnits.Where(unit => unit.Player.Color != player.Color);
            foreach (var unit in playersNewUnits)
            {
                unit.RemovePlaceCommand();
            }

            currentTurn.AllianceProposals.RemoveWhere(proposal => proposal.FromPlayer.Color != player.Color);

            // When planning the turns, only see own alliances.
            if (currentTurn.Mode == TurnMode.PlanMoves)
            {
                IEnumerable<AlliancePair> ownAlliancePairs = currentTurn.Alliances.AlliancePairs.Where(pair => pair.PlayerA.Color == player.Color || pair.PlayerB.Color == player.Color);

                currentTurn.Alliances.ResetAlliances();

                foreach (var pair in ownAlliancePairs)
                {
                    currentTurn.Alliances.AddAlliance(pair.PlayerA, pair.PlayerB);
                }
            }

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

        /// <summary>Remove all commands for the next turn that was assigned to the specified player, i.e. place commands, move commands and alliance proposals.</summary>
        public void DeleteNextTurnCommands(string playerColor)
        {
            IEnumerable<Unit> unitsOnBoard = NextTurn.UnitsOnCells.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> newUnits = NextTurn.NewUnits.Where(unit => unit.Player.Color == playerColor);
            IEnumerable<Unit> unitsBelongingToPlayer = unitsOnBoard.Concat(newUnits);
            foreach (var unit in unitsBelongingToPlayer)
            {
                unit.RemoveCommands();
            }

            NextTurn.AllianceProposals.RemoveWhere(proposal => proposal.FromPlayer.Color == playerColor);
        }

        /// <summary>Returns the player matching the IP address and the user agent string. If no players a found, a player will be created.</summary>
        public Player GetPlayer(Guid id)
        {
            Player matchingPlayer = Players.FirstOrDefault(player => player.Id == id);

            if (matchingPlayer == null)
            {
                return AddPlayer(id);
            }

            return matchingPlayer;
        }

        internal Player GetPlayer(string playerColor)
        {
            Player player = Players.Single(p => p.Color == playerColor);
            return player;
        }

        private void PerformPlanMovesTurn()
        {
            // Place all new units, removing the place commands.
            List<Unit> unitsToPlace = NextTurn.NewUnits.Where(newUnit => newUnit.PlaceCommand != null).ToList();
            unitsToPlace.ForEach(unitToPlace =>
            {
                NextTurn.NewUnits.Remove(unitToPlace);
                unitToPlace.PlaceCommand.On.AddUnit(unitToPlace);
                unitToPlace.RemovePlaceCommand();
                unitToPlace.NoLongerNewUnit();
            });

            // Move all the units, keeping the move commands.
            List<Unit> unitsToMove = NextTurn.UnitsOnCells.Where(unit => unit.MoveCommand != null).ToList();
            unitsToMove.ForEach(unitToMove =>
            {
                unitToMove.Cell.RemoveUnit(unitToMove);
                unitToMove.MoveCommand.To.AddUnit(unitToMove);
            });

            // Mark the units as killed.
            NextTurn.Fight();

            PreviousTurn = NextTurn.Clone();

            // Remove killed units.
            IEnumerable<Unit> unitsToRemove = NextTurn.UnitsOnCells.Where(unit => unit.Killed).ToList();
            foreach (var unitToRemove in unitsToRemove)
            {
                unitToRemove.Cell.RemoveUnit(unitToRemove);
            }

            // Remove the move commands.
            foreach (var unit in NextTurn.AllUnits)
            {
                unit.RemoveMoveCommand();
            }

            // Assign new units to the players, add points to them and set their ready state to false.
            Players.ForEach(player =>
            {
                NextTurn.AddNewUnitsToPlayer(player, GetNumberOfNewUnitsForPlayer(player));
                AddPointsToPlayer(player);
                player.CommandsSentOn = null;
                player.Ready = false;
            });

            NextTurn.Mode = TurnMode.ProposeAlliances;
        }

        private void PerformProposeAlliancesTurn()
        {
            // Remove the old alliances.
            NextTurn.Alliances.ResetAlliances();

            // Loop through each player's alliance proposals. See if there is a reverse proposal. If so, then create an alliance between the two players.
            Players.ForEach(player =>
            {
                IEnumerable<AllianceProposal> playersProposals = NextTurn.AllianceProposals.Where(proposal => proposal.FromPlayer.Color == player.Color);
                IEnumerable<AllianceProposal> acceptedProposals = playersProposals.Where(proposal => NextTurn.AllianceProposals.Count(reverseProposal => reverseProposal.FromPlayer == proposal.ToPlayer && reverseProposal.ToPlayer == proposal.FromPlayer) > 0);
                foreach (var proposal in acceptedProposals)
                {
                    NextTurn.Alliances.AddAlliance(proposal.FromPlayer, proposal.ToPlayer);
                }
            });

            // Remove all alliance proposals.
            NextTurn.AllianceProposals.RemoveWhere(proposal => true);

            Players.ForEach(player =>
            {
                player.CommandsSentOn = null;
                player.Ready = false;
            });

            NextTurn.Mode = TurnMode.PlanMoves;
        }

        /// <summary>Executes the commands, updating the boards. Resolves combats. Assigns new units.</summary>
        /// <remarks>All commands are stored on the NextTurn board. After each step of the turn the board is cloned to one for of the previous boards, which will allows the clients to show the different steps executed in the turn.</remarks>
        private void PerformTurn()
        {
            lock (TurnLock)
            {
                switch (NextTurn.Mode)
                {
                    case TurnMode.PlanMoves:
                        PerformPlanMovesTurn();
                        break;

                    case TurnMode.ProposeAlliances:
                        PerformProposeAlliancesTurn();
                        break;

                    default:
                        throw new NotSupportedException($"Turn mode {NextTurn.Mode} is not supported.");
                }

                NextTurn.IncreaseTurnNumber();
            }
        }

        private void PerformTurnIfAllPlayersAreReady()
        {
            if (Players.All(player => player.Ready))
            {
                PerformTurn();
            }
        }

        public void ResetGame()
        {
            PreviousTurn = null;
            Players = new List<Player>();
            GridSize = 1; // Necessary to avoid an error in CanvasSettings.initialize().
            NextTurn = new Turn(GridSize); // Necessary to avoid a null reference exception.
            NextTurn.Mode = TurnMode.StartGame;
        }

        public void SetAllPlayersSeemToBeHere(Player player, bool allSeemToBeHere)
        {
            lock (SetAllPlayersSeemToBeHereLock)
            {
                player.Ready = allSeemToBeHere;

                if (Players.All(p => p.Ready))
                {
                    StartGame();
                }
            }
        }

        public void SetPlayerReadyStatus(string playerColor, bool isReady)
        {
            Player player = Players.Single(p => p.Color == playerColor);
            player.Ready = isReady;

            PerformTurnIfAllPlayersAreReady();
        }

        private void StartGame()
        {
            lock (StartGameLock)
            {
                if (Started)
                {
                    throw new ApplicationException("The game is already started.");
                }

                switch (NumberOfPlayers)
                {
                    case 1:
                    case 2:
                    case 3:
                        GridSize = 1;
                        break;

                    case 4:
                    case 5:
                    case 6:
                        GridSize = 2;
                        break;

                    default:
                        throw new IndexOutOfRangeException($"The games does not support {NumberOfPlayers} playeres.");
                }

                NextTurn = new Turn(GridSize);
                NextTurn.Mode = TurnMode.PlanMoves;
                NextTurn.IncreaseTurnNumber();

                for (int i = 0; i < NumberOfPlayers; i++)
                {
                    Player player = Players[i];
                    AddStartingUnitsToTheBoard(player, i, Settings.NumberOfStartingUnits, NumberOfPlayers);
                    player.Ready = false;
                }
            }
        }

        public void UpdateCommandsSentOn(string playerColor)
        {
            Players.Single(player => player.Color == playerColor).CommandsSentOn = DateTime.UtcNow;
        }
    }
}
