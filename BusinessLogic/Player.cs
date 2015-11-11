using System;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Player : IEquatable<Player>
    {
        internal Player(PlayerColors colors, IPAddress ipAddress, string userAgent)
        {
            Color = colors.MainColor;
            CommandsSentOn = null;
            IpAddress = ipAddress;
            TextColor = colors.TextColor;
            UserAgent = userAgent;

            Points = 0;
            Ready = false;
        }

        /// <summary>The main color also identifies a player, so use this property the player ID.</summary>
        public string Color { get; }

        public DateTime? CommandsSentOn { get; set; }

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
