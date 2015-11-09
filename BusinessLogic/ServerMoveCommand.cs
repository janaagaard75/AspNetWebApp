namespace CocaineCartels.BusinessLogic
{
    public class ServerMoveCommand
    {
        public ServerMoveCommand(Cell from, Cell to)
        {
            From = from;
            To = to;
        }

        internal Cell From { get; }
        internal Cell To { get; }

        public Hex FromHex => From.Hex;
        public Hex ToHex => To.Hex;
    }
}
