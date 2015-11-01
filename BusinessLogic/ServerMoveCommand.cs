namespace CocaineCartels.BusinessLogic
{
    public class ServerMoveCommand : ServerCommand
    {
        public ServerMoveCommand(Unit unit, Cell to)
            : base(unit)
        {
            To = to;
        }

        internal readonly Cell To;

        public Hex ToHex => To.Hex;
    }
}
