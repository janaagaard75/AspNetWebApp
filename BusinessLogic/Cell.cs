using System;
using System.Collections.Generic;
using System.Linq;

namespace CocaineCartels.BusinessLogic
{
    public class Cell : IEquatable<Cell>
    {
        public Cell(Turn turn, int r, int s, int t)
        {
            Hex = new Hex(r, s, t);
            Turn = turn;
            UnitsList = new List<Unit>();
        }

        private readonly List<Unit> UnitsList;
        private readonly Turn Turn;

        public readonly Hex Hex;

        public IEnumerable<Unit> Units => UnitsList;

        internal void AddUnit(Unit unit)
        {
            if (unit.Cell != null)
            {
                throw new ApplicationException("Can't add unit to cell because it'a already placed on another cell.");
            }

            unit.Cell = this;
            UnitsList.Add(unit);
        }

        internal void Fight()
        {
            switch (Settings.GameMode)
            {
                case GameMode.AlliancesInSeparateTurns:
                    FightWithAlliances();
                    break;

                case GameMode.NoAlliances:
                    while (PlayersOnCell().Count() > 1)
                    {
                        RemoveAUnitFromEachPlayer();
                    }
                    break;

                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        private void FightWithAlliances()
        {
            bool somebodyDied;
            do
            {
                somebodyDied = FightWithAlliances2();
            }
            while (somebodyDied);
        }

        private bool FightWithAlliances2()
        {
            IEnumerable<string> playersOnCell = PlayersOnCell();

            Dictionary<string, double> damagePerPlayer = new Dictionary<string, double>();
            foreach (string player in playersOnCell)
            {
                damagePerPlayer.Add(player, 0);
            }

            // Calculate the amount of damage for each player.
            foreach (string player in playersOnCell)
            {
                IEnumerable<string> allies = Turn.Alliances.GetAllies(player);
                IEnumerable<string> enemies = playersOnCell.Except(allies).Except(new[] { player });

                double numberOfPlayersUnits = UnitsList.Count(unit => unit.Player.Color == player);
                double damagePerEnemy = numberOfPlayersUnits / enemies.Count();

                foreach (string enemy in enemies)
                {
                    damagePerPlayer[enemy] = damagePerPlayer[enemy] + damagePerEnemy;
                }
            }

            // Remove units from each player.
            bool somebodyDied = false;
            foreach (string player in playersOnCell)
            {
                int numberOfPlayersUnits = UnitsList.Count(unit => unit.Player.Color == player);
                int unitsAfterDamage = Convert.ToInt32(Math.Round(numberOfPlayersUnits - damagePerPlayer[player], MidpointRounding.AwayFromZero));
                int unitsToRemove = numberOfPlayersUnits - unitsAfterDamage;
                if (unitsToRemove > numberOfPlayersUnits)
                {
                    unitsToRemove = numberOfPlayersUnits;
                }

                if (unitsToRemove > 0)
                {
                    somebodyDied = true;
                }

                RemoveUnitsFromPlayer(player, unitsToRemove);
            }

            return somebodyDied;
        }

        private IEnumerable<string> PlayersOnCell()
        {
            IEnumerable<string> players = UnitsList.GroupBy(unit => unit.Player.Color).Select(g => g.Key);
            return players;
        }

        private void RemoveUnitsFromPlayer(string player, int numberOfUnits)
        {
            for (int i = 0; i < numberOfUnits; i++)
            {
                Unit unitToRemove = Units.FirstOrDefault(unit => unit.Player.Color == player);
                if (unitToRemove != null)
                {
                    RemoveUnit(unitToRemove);
                }
            }
        }

        private void RemoveAUnitFromEachPlayer()
        {
            Game.Instance.Players.ForEach(player =>
            {
                RemoveUnitsFromPlayer(player.Color, 1);
            });
        }

        internal void RemoveUnit(Unit unit)
        {
            if (unit.Cell != this)
            {
                throw new ApplicationException("Trying to remove a unit that isn't placed on this cell.");
            }

            unit.Cell = null;
            UnitsList.Remove(unit);
        }

        public bool Equals(Cell other)
        {
            return Hex.Equals(other.Hex);
        }
    }
}
