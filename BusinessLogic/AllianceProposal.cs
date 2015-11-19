namespace CocaineCartels.BusinessLogic
{
    public class AllianceProposal
    {
        public AllianceProposal(string fromPlayer, string toPlayer)
        {
            FromPlayer = fromPlayer;
            ToPlayer = toPlayer;
        }

        public string FromPlayer { get; }
        public string ToPlayer { get; }
    }
}
