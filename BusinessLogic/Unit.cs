using System;

namespace CocaineCartels.BusinessLogic
{
    public class Unit
    {
        public Unit(Player player)
        {
            MoveCommand = null;
            NewUnit = true;
            PlaceCommand = null;
            Player = player;
        }

        public ServerMoveCommand MoveCommand { get; private set; }
        public bool NewUnit { get; private set; }
        public ServerPlaceCommand PlaceCommand { get; private set; }
        public readonly Player Player;

        internal Cell Cell;

        internal void NoLongerNewUnit()
        {
            NewUnit = false;
        }

        public void RemoveCommands()
        {
            RemovePlaceCommand();
            RemoveMoveCommand();
        }

        public void RemoveMoveCommand()
        {
            MoveCommand = null;
        }

        public void RemovePlaceCommand()
        {
            PlaceCommand = null;
        }

        public void SetMoveCommand(Cell from, Cell to)
        {
            if (from == null)
            {
                throw new ArgumentNullException(nameof(from));
            }

            if (to == null)
            {
                throw new ArgumentNullException(nameof(to));
            }

            if (Cell == null && PlaceCommand == null)
            {
                throw new ApplicationException("Can only assign a move command to a unit is positioned on a cell or has a place command.");
            }

            MoveCommand = new ServerMoveCommand(from, to);
        }

        public void SetPlaceCommand(Cell on)
        {
            if (on == null)
            {
                throw new ArgumentNullException(nameof(on));
            }

            if (Cell != null)
            {
                throw new ApplicationException("Can only assign a place command to a unit that isn't positioned on a cell.");
            }

            PlaceCommand = new ServerPlaceCommand(on);
        }
    }
}
