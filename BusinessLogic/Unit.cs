using System;

namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            ServerMoveCommand = null;
            ServerPlaceCommand = null;
            Player = player;
        }

        public ServerMoveCommand ServerMoveCommand { get; private set; }
        public ServerPlaceCommand ServerPlaceCommand { get; private set; }
        public readonly Player Player;

        internal Cell Cell;

        public void RemoveCommands()
        {
            ServerPlaceCommand = null;
            ServerMoveCommand = null;
        }

        public void SetMoveCommand(Cell from)
        {
            if (Cell == null)
            {
                throw new ApplicationException("Cannot assign a move command to a unit that isn't positioned on a cell.");
            }

            ServerMoveCommand = new ServerMoveCommand(this, from);
        }

        public void SetPlaceCommand(Cell on)
        {
            if (Cell != on)
            {
                throw new ApplicationException("Can only assign a place command to a unit's current cell.");
            }

            ServerPlaceCommand = new ServerPlaceCommand(this, on);
        }
    }
}
