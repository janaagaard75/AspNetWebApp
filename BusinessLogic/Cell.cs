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
            bool somebodyDied;
            do
            {
                somebodyDied = FightWithAlliances();
            }
            while (somebodyDied);
        }

        private bool FightWithAlliances()
        {
            IEnumerable<Player> playersOnCell = PlayersOnCell();

            Dictionary<Player, double> damagePerPlayer = new Dictionary<Player, double>();
            foreach (Player player in playersOnCell)
            {
                damagePerPlayer.Add(player, 0);
            }

            // Calculate the amount of damage for each player.
            foreach (Player player in playersOnCell)
            {
                IEnumerable<Player> allies = Turn.Alliances.GetAllies(player);
                IEnumerable<Player> enemies = playersOnCell.Except(allies).Except(new[] { player });

                double playersNumberOfUnits = UnitsList.Count(unit => unit.Player.Color == player.Color && !unit.Killed);
                double damagePerEnemy = playersNumberOfUnits / enemies.Count();

                foreach (Player enemy in enemies)
                {
                    damagePerPlayer[enemy] = damagePerPlayer[enemy] + damagePerEnemy;
                }
            }

            // Remove units from each player.
            bool somebodyDied = false;
            foreach (Player player in playersOnCell)
            {
                int numberOfPlayersUnits = UnitsList.Count(unit => unit.Player.Color == player.Color);
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

                MarkUnitsKilled(player, unitsToRemove);
            }

            return somebodyDied;
        }

        private void MarkUnitsKilled(Player player, int numberOfUnits)
        {
            for (var i = 0; i < numberOfUnits; i++)
            {
                Unit unitToMarkKilled = Units.FirstOrDefault(unit => unit.Player.Color == player.Color && !unit.Killed);
                if (unitToMarkKilled != null)
                {
                    unitToMarkKilled.KillUnit();
                }
            }
        }

        private IEnumerable<Player> PlayersOnCell()
        {
            IEnumerable<Player> players = UnitsList.Where(unit => !unit.Killed).GroupBy(unit => unit.Player.Color).Select(g => Game.Instance.GetPlayer(g.Key));
            return players;
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
