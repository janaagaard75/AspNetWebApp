namespace CocaineCartels.BusinessLogic
{
    public class MoveCommand : Command
    {
        public MoveCommand(Unit unit, Cell from)
            : base(unit)
        {
            From = from;
        }

        internal readonly Cell From;

        public Hex FromHex => From.Hex;
    }
}
