namespace CocaineCartels.BusinessLogic
{
    public class PlaceCommand : Command
    {
        public PlaceCommand(Unit unit, Cell on)
            : base(unit)
        {
            On = on;
        }

        public readonly Cell On;
    }
}
