using System;
using System.Net;
using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Player
    {
        internal Player(string colors, string name, IPAddress ipAddress, string userAgent)
        {
            Color = colors;
            CommandsSentOn = null;
            IpAddress = ipAddress;
            Name = name;
            UserAgent = userAgent;

            Points = 0;
            PointsLastTurn = 0;
            Ready = false;
        }

        /// <summary>The main color also identifies a player, so use this property the player ID.</summary>
        public string Color { get; }

        public DateTime? CommandsSentOn { get; set; }

        [JsonIgnore]
        public IPAddress IpAddress { get; }

        public string Name { get; }

        public int Points { get; set; }

        public int PointsLastTurn { get; set; }

        /// <summary>If the game hasn't started yet: The player believe that all players are here. If the game has started: The player has sent in commands and is thus ready for the next turn.</summary>
        public bool Ready { get; set; }

        [JsonIgnore]
        public readonly string UserAgent;
    }
}
