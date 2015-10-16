using System;
using System.Collections.Generic;

namespace CocaineCartels.BusinessLogic
{
    public class Cell
    {
        public Cell(int r, int s, int t)
        {
            int sum = r + s + t;
            if (sum != 0)
            {
                throw new ApplicationException($"The sum of r, s and t must be 0. It's {sum}.");
            }

            R = r;
            S = s;
            T = t;

            Units = new List<Unit>();
        }

        public int R { get; private set; }
        public int S { get; private set; }
        public int T { get; private set; }
        public IEnumerable<Unit> Units;
    }
}
