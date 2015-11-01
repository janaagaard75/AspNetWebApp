namespace CocaineCartels.BusinessLogic
{
    public class ServerMoveCommand : Command
    {
        public ServerMoveCommand(Unit unit, Cell from)
            : base(unit)
        {
            From = from;
        }

        internal readonly Cell From;

        public Hex FromHex => From.Hex;
    }
}
