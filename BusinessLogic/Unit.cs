namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            MoveCommand = null;
            PlaceCommand = null;
            Player = player;
        }

        public readonly MoveCommand MoveCommand;
        public readonly PlaceCommand PlaceCommand;
        public readonly Player Player;

        internal Cell Cell;
    }
}
