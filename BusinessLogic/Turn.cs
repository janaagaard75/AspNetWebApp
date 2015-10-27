using System.Collections.Generic;

namespace CocaineCartels.BusinessLogic
{
    internal class Turn
    {
        /// <summary>First turn.</summary>
        public Turn(int gridSize)
        {
            Board = new Board(gridSize);
            NewUnits = new List<Unit>();
        }

        /// <summary>Subsequent turns.</summary>
        public Turn(Board previousBoard, List<Unit> previousNewUnits)
        {
            Board = previousBoard.Copy();
            NewUnits = previousNewUnits.Copy();
        }

        public Board Board { get; private set; }
        public List<Unit> NewUnits { get; private set; }
    }
}
