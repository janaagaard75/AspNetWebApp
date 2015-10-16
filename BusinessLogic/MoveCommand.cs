namespace CocaineCartels.BusinessLogic
{
    public class MoveCommand
    {
        // TODO: Can't use a cell reference here, since it has to be serializeable.
        public MoveCommand(Cell to)
        {
            To = to;
        }

        public Cell To { get; private set; }
    }
}
