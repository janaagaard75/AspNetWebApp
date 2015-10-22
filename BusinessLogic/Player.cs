using System.Collections.Generic;
using System.Linq;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Player
    {
        internal Player(string color, IPAddress ipAddress, string userAgent)
        {
            Color = color;
            IpAddress = ipAddress;
            UserAgent = userAgent;

            NewUnitsList = new List<Unit>();
        }

        private readonly List<Unit> NewUnitsList;

        /// <summary>The color also identifies a player, so use this property the player ID.</summary>
        public readonly string Color;

        public IEnumerable<Unit> NewUnits => NewUnitsList;
            
        [JsonIgnore]
        public readonly IPAddress IpAddress;

        [JsonIgnore]
        public readonly string UserAgent;

        public void AddUnit(Unit newUnit)
        {
            NewUnitsList.Add(newUnit);
        }

        public void RemoveUnit(Unit unitToRemove)
        {
            NewUnitsList.Remove(unitToRemove);
        }
    }
}
