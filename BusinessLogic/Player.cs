using System;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Player : IEquatable<Player>
    {
        internal Player(bool administrator, PlayerColors colors, IPAddress ipAddress, string userAgent)
        {
            Administrator = administrator;
            Color = colors.MainColor;
            IpAddress = ipAddress;
            TextColor = colors.TextColor;
            UserAgent = userAgent;

            Points = 0;
            Ready = false;
        }

        public bool Administrator { get; }

        /// <summary>The main color also identifies a player, so use this property the player ID.</summary>
        public string Color { get; }

        [JsonIgnore]
        public IPAddress IpAddress { get; }

        public int Points { get; set; }

        /// <summary>The player has sent in commands and is thus ready for the next turn.</summary>
        public bool Ready { get; set; }

        public string TextColor { get; }

        [JsonIgnore]
        public readonly string UserAgent;

        public bool Equals(Player other)
        {
            bool areEqual = Color == other.Color;
            return areEqual;
        }
    }
}
