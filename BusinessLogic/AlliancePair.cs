using System;
using static System.String;

namespace CocaineCartels.BusinessLogic
{
    public class AlliancePair
    {
        public AlliancePair(Player playerA, Player playerB)
        {
            if (playerA.Color == playerB.Color)
            {
                throw new ApplicationException("A player cannot ally with oneself.");
            }

            // Always order the players in a consistent way.
            if (Compare(playerA.Color, playerB.Color, StringComparison.Ordinal) < 0)
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

        public Player PlayerA { get; }
        public Player PlayerB { get; }
    }
}
