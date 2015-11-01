using System;
using System.Collections.Generic;
using System.Linq;

namespace CocaineCartels.BusinessLogic
{
    public class Cell
    {
        public Cell(int r, int s, int t)
        {
            Hex = new Hex(r, s, t);
            UnitsList = new List<Unit>();
        }

        private readonly List<Unit> UnitsList;

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
            while (NumberOfPlayersOnCell() > 1)
            {
                RemoveAUnitFromEachPlayer();
            }
        }

        private int NumberOfPlayersOnCell()
        {
            int numberOfPlayers = UnitsList.GroupBy(unit => unit.Player.Color).Count();
            return numberOfPlayers;
        }

        private void RemoveAUnitFromEachPlayer()
        {
            Game.Instance.Players.ForEach(player =>
            {
                Unit unitToRemove = Units.FirstOrDefault(unit => unit.Player.Equals(player));
                if (unitToRemove != null)
                {
                    RemoveUnit(unitToRemove);
                }
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
    }
}
