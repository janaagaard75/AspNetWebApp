namespace CocaineCartels.BusinessLogic
{
    public class ServerMoveCommand : Command
    {
        public ServerMoveCommand(Unit unit, Cell from, Cell to)
            : base(unit)
        {
            From = from;
            To = to;
        }

        internal readonly Cell From;
        internal readonly Cell To;

        public Hex FromHex => From.Hex;
        public Hex ToHex => From.Hex;
    }
}
