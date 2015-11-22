using System;

namespace CocaineCartels.BusinessLogic
{
    public class AllianceProposal
    {
        public AllianceProposal(Player fromPlayer, Player toPlayer)
        {
            if (fromPlayer.Color == toPlayer.Color)
            {
                throw new ApplicationException("Cannot propose an alliance with oneself.");
            }

            FromPlayer = fromPlayer;
            ToPlayer = toPlayer;
        }

        public Player FromPlayer { get; }
        public Player ToPlayer { get; }
    }
}
