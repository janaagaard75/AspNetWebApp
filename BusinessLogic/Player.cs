using System;
using System.Linq;
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

            Points = 0;
            Ready = false;
        }

        public bool Administrator { get; }

        /// <summary>The color also identifies a player, so use this property the player ID.</summary>
        public readonly string Color;

        [JsonIgnore]
        public readonly IPAddress IpAddress;

        public int Points { get; set; }

        /// <summary>The player has sent in commands and is thus ready for the next turn.</summary>
        public bool Ready;

        [JsonIgnore]
        public readonly string UserAgent;

        public bool Equals(Player other)
        {
            bool areEqual = Color == other.Color;
            return areEqual;
        }

        public int NumberOfCells()
        {
            int numberOfCells = Game.Instance.CurrentTurn.Cells.Count(cell => cell.Units.Any(unit => unit.Player.Equals(this)));
            return numberOfCells;
        }
    }
}
