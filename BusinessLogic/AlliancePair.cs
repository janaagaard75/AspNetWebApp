using System;
using static System.String;

namespace CocaineCartels.BusinessLogic
{
    public class AlliancePair
    {
        public AlliancePair(string playerA, string playerB)
        {
            if (playerA == playerB)
            {
                throw new ApplicationException("A player cannot ally with oneself.");
            }

            // Always order the players in a consistent way.
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
