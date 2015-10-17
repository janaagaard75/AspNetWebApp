namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            MoveCommand = null;
            PlaceCommand = null;
            Player = player;
            PlayerColor = player.Color;
        }

        public MoveCommand MoveCommand;
        public PlaceCommand PlaceCommand;
        public readonly string PlayerColor;

        internal Cell Cell;
        internal readonly Player Player;
    }
}
