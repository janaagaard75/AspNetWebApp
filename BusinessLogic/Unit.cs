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

        public MoveCommand MoveCommand { get; private set; }
        public PlaceCommand PlaceCommand { get; private set; }
        public readonly Player Player;

        internal Cell Cell;

        public void RemoveCommands()
        {
            PlaceCommand = null;
            MoveCommand = null;
        }

        public void SetMoveCommand(Cell from)
        {
            if (Cell == null)
            {
                throw new ApplicationException("Cannot assign a move command to a unit that isn't positioned on a cell.");
            }

            MoveCommand = new MoveCommand(this, from);
        }

        public void SetPlaceCommand(Cell on)
        {
            if (Cell != on)
            {
                throw new ApplicationException("Can only assign a place command to a unit's current cell.");
            }

            PlaceCommand = new PlaceCommand(this, on);
        }
    }
}
