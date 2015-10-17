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

        public int ToR => To.R;
        public int ToS => To.S;
        public int ToT => To.T;
    }
}
