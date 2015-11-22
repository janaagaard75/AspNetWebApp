using System;

namespace CocaineCartels.BusinessLogic
{
    public class Player
    {
        internal Player(Guid id, string colors, string name)
        {
            Id = id;
            Color = colors;
            Name = name;

            CommandsSentOn = null;
            Points = 0;
            PointsLastTurn = 0;
            Ready = false;
        }

        internal Guid Id { get; }

        /// <summary>The main color also identifies a player, so use this property the player ID.</summary>
        public string Color { get; }

        public DateTime? CommandsSentOn { get; set; }

        public string Name { get; }

        public int Points { get; set; }

        public int PointsLastTurn { get; set; }

        /// <summary>If the game hasn't started yet: The player believe that all players are here. If the game has started: The player has sent in commands and is thus ready for the next turn.</summary>
        public bool Ready { get; set; }
    }
}
