namespace CocaineCartels.BusinessLogic
{
    public class ServerPlaceCommand
    {
        public ServerPlaceCommand(Cell on)
        {
            On = on;
        }

        internal Cell On { get; }

        public Hex OnHex => On.Hex;
    }
}
