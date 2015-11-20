using System;

namespace CocaineCartels.BusinessLogic
{
    public class AllianceProposal
    {
        public AllianceProposal(string fromPlayer, string toPlayer)
        {
            if (fromPlayer == toPlayer)
            {
                throw new ApplicationException("Cannot propose an alliance with oneself.");
            }

            FromPlayer = fromPlayer;
            ToPlayer = toPlayer;
        }

        public string FromPlayer { get; }
        public string ToPlayer { get; }
    }
}
