namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            PlayerColor = player.Color;
        }

        public string PlayerColor { get; private set; }
        public MoveCommand MoveCommand;
        public PlaceCommand PlaceCommand;
    }
}
