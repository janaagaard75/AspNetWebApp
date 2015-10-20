namespace CocaineCartels.BusinessLogic
{
    public class PlaceCommand : Command
    {
        public PlaceCommand(Unit unit, Cell on)
            : base(unit)
        {
            On = on;
        }

        internal readonly Cell On;

        public Hex OnHex => On.Hex;
    }
}
