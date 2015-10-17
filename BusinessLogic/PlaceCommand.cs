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

        public int OnR => On.R;
        public int OnS => On.S;
        public int OnT => On.T;
    }
}
