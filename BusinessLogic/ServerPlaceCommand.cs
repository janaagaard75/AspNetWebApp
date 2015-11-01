namespace CocaineCartels.BusinessLogic
{
    public class ServerPlaceCommand : Command
    {
        public ServerPlaceCommand(Unit unit, Cell on)
            : base(unit)
        {
            On = on;
        }

        internal readonly Cell On;

        public Hex OnHex => On.Hex;
    }
}
