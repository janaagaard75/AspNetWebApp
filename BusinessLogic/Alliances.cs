using System;
using System.Collections.Generic;
using static System.String;

namespace CocaineCartels.BusinessLogic
{
    public class Alliances
    {
        public Alliances()
        {
            ResetAlliances();
        }

        public HashSet<Tuple<string, string>> AlliancePairs { get; private set; }

        public void AddAlliance(string playerA, string playerB)
        {
            AlliancePairs.Add(GetPair(playerA, playerB));
        }

        public bool AreAllied(string playerA, string playerB)
        {
            return AlliancePairs.Contains(GetPair(playerA, playerB));
        }

        public void ResetAlliances()
        {
            AlliancePairs = new HashSet<Tuple<string, string>>();
        }

        private static Tuple<string, string> GetPair(string playerA, string playerB)
        {
            Tuple<string, string> alliedPair;
            if (Compare(playerA, playerB, StringComparison.Ordinal) < 0)
            {
                alliedPair = new Tuple<string, string>(playerA, playerB);
            }
            else
            {
                alliedPair = new Tuple<string, string>(playerB, playerA);
            }

            return alliedPair;
        }
    }
}
