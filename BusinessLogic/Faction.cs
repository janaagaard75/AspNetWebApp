using System.Collections.Generic;

namespace CocaineCartels.BusinessLogic
{
    internal class Faction
    {
        public Faction()
        {
            Players = new List<string>();
        }

        public List<string> Players { get; } 
    }
}
