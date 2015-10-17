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

        public readonly MoveCommand MoveCommand;
        public readonly PlaceCommand PlaceCommand;
        internal readonly Player Player;
        public readonly string PlayerColor;
    }
}
