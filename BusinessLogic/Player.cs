using System.Collections.Generic;
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

            NewUnits = new Unit[0];
        }

        /// <summary>The color also identifies a player, so use this property the player ID.</summary>
        public readonly string Color;

        public readonly IEnumerable<Unit> NewUnits;
            
        [JsonIgnore]
        public readonly IPAddress IpAddress;

        [JsonIgnore]
        public readonly string UserAgent;
    }
}
