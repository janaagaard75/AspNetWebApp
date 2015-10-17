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

        public int R => To.R;
        public int S => To.S;
        public int T => To.T;
    }
}
