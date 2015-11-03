using System;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Player : IEquatable<Player>
    {
        internal Player(bool administrator, string color, IPAddress ipAddress, string userAgent)
        {
            Administrator = administrator;
            Color = color;
            IpAddress = ipAddress;
            UserAgent = userAgent;

            Ready = false;
        }

        /// <summary>The color also identifies a player, so use this property the player ID.</summary>
        public readonly string Color;

        /// <summary>The player has sent in commands and is thus ready for the next turn.</summary>
        public bool Ready;

        public bool Administrator { get; }

        [JsonIgnore]
        public readonly IPAddress IpAddress;

        [JsonIgnore]
        public readonly string UserAgent;

        public bool Equals(Player other)
        {
            bool areEqual = Color == other.Color;
            return areEqual;
        }
    }
}
