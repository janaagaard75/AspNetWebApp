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
        }

        /// <summary>The color also identifies a player, so use this property the player ID.</summary>
        public readonly string Color;

        [JsonIgnore]
        public readonly IPAddress IpAddress;

        [JsonIgnore]
        public readonly string UserAgent;
    }
}
