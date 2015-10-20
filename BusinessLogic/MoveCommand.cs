namespace CocaineCartels.BusinessLogic
{
    public class MoveCommand : Command
    {
        public MoveCommand(Unit unit, Cell to)
            : base(unit)
        {
            To = to;
        }

        internal readonly Cell To;

        public Hex ToHex => To.Hex;
    }
}
