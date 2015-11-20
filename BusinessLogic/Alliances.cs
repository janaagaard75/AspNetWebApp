using System.Collections.Generic;
using System.Linq;

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

        public IEnumerable<string> GetAllies(string player)
        {
            HashSet<string> allies = new HashSet<string>();

            foreach (var pair in AlliancePairs)
            {
                if (pair.PlayerA == player)
                {
                    allies.Add(pair.PlayerB);
                }
                else if (pair.PlayerB == player)
                {
                    allies.Add(pair.PlayerA);
                }
            }

            return allies;
        }

        public void ResetAlliances()
        {
            AlliancePairs = new HashSet<AlliancePair>();
        }
    }
}
