using System;

namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            MoveCommand = null;
            PlaceCommand = null;
            Player = player;
        }

        public ServerMoveCommand MoveCommand { get; private set; }
        public ServerPlaceCommand PlaceCommand { get; private set; }
        public readonly Player Player;

        internal Cell Cell;

        public void RemoveCommands()
        {
            PlaceCommand = null;
            MoveCommand = null;
        }

        public void SetMoveCommand(Cell to)
        {
            if (Cell == null)
            {
                throw new ApplicationException("Cannot assign a move command to a unit that isn't positioned on a cell.");
            }

            MoveCommand = new ServerMoveCommand(this, to);
        }

        public void SetPlaceCommand(Cell on)
        {
            if (Cell != on)
            {
                throw new ApplicationException("Can only assign a place command to a unit's current cell.");
            }

            PlaceCommand = new ServerPlaceCommand(this, on);
        }
    }
}
