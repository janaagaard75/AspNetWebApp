using System.Collections.Generic;

namespace CocaineCartels.BusinessLogic
{
    public class Alliances
    {
        public Alliances()
        {
            ResetAlliances();
        }

        public HashSet<AlliancePair> AlliancePairs { get; private set; }

        public void AddAlliance(string playerA, string playerB)
        {
            AlliancePair alliance = new AlliancePair(playerA, playerB);
            AlliancePairs.Add(alliance);
        }

        public void ResetAlliances()
        {
            AlliancePairs = new HashSet<AlliancePair>();
        }
    }
}
