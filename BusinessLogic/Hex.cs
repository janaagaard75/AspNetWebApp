using System;

namespace CocaineCartels.BusinessLogic
{
    public class Hex : IEquatable<Hex>
    {
        public Hex(int r, int s, int t)
        {
            int sum = r + s + t;
            if (sum != 0)
            {
                throw new ApplicationException($"The sum of r, s and t must be 0. It's {sum}.");
            }

            R = r;
            S = s;
            T = t;
        }

        public int R { get; }
        public int S { get; }
        public int T { get; }

        public bool Equals(Hex other)
        {
            bool equals = (R == other.R && S == other.S && T == other.T);
            return equals;
        }

        public override string ToString()
        {
            return $"({R},{S},{T})";
        }
    }
}
