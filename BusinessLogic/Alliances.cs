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

        public void AddAlliance(Player playerA, Player playerB)
        {
            AlliancePair alliance = new AlliancePair(playerA, playerB);

            foreach (var existingPair in AlliancePairs)
            {
                if (alliance.PlayerA == existingPair.PlayerA && alliance.PlayerB == existingPair.PlayerB)
                {
                    // Already in the list.
                    return;
                }
            }

            AlliancePairs.Add(alliance);
        }

        public IEnumerable<Player> GetAllies(Player player)
        {
            HashSet<Player> allies = new HashSet<Player>();

            foreach (var pair in AlliancePairs)
            {
                if (pair.PlayerA.Color == player.Color)
                {
                    allies.Add(pair.PlayerB);
                }
                else if (pair.PlayerB.Color == player.Color)
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
