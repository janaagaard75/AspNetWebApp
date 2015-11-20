using System;
using static System.String;

namespace CocaineCartels.BusinessLogic
{
    public class AlliancePair
    {
        public AlliancePair(string playerA, string playerB)
        {
            if (Compare(playerA, playerB, StringComparison.Ordinal) < 0)
            {
                PlayerA = playerA;
                PlayerB = playerB;
            }
            else
            {
                PlayerA = playerB;
                PlayerB = playerA;
            }
        }

        public string PlayerA { get; }
        public string PlayerB { get; }
    }
}
