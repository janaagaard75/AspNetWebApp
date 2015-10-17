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

        public readonly int R;
        public readonly int S;
        public readonly int T;
        public readonly IEnumerable<Unit> Units;
    }
}
