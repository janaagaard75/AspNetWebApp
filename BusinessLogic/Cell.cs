using System;
using System.Collections.Generic;

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

        public void RemoveUnit(Unit unit)
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
