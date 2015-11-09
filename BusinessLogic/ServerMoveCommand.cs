using System;

namespace CocaineCartels.BusinessLogic
{
    public class ServerMoveCommand
    {
        public ServerMoveCommand(Cell from, Cell to)
        {
            if (from == null)
            {
                throw new ArgumentNullException(nameof(from));
            }

            if (to == null)
            {
                throw new ArgumentNullException(nameof(to));
            }

            if (from.Equals(to))
            {
                throw new ApplicationException("Cannot move unit from one cell to the same cell.");
            }

            From = from;
            To = to;
        }

        internal Cell From { get; }
        internal Cell To { get; }

        public Hex FromHex => From.Hex;
        public Hex ToHex => To.Hex;
    }
}
