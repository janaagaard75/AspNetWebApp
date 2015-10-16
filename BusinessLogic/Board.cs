using System.Collections.Generic;

namespace CocaineCartels.BusinessLogic
{
    public class Board
    {
        public Board(int gridSize)
        {
            var cells = new List<Cell>();
            for (int r = -gridSize; r <= gridSize; r++)
            {
                for (int s = -gridSize; s <= gridSize; s++)
                {
                    int t = -r - s;

                    if (t < -gridSize || t > gridSize)
                    {
                        continue;
                    }

                    var cell = new Cell(r, s, t);
                    cells.Add(cell);
                }
            }

            Cells = cells;

            GridSize = gridSize;
        }

        public IEnumerable<Cell> Cells { get; private set; }
        public int GridSize { get; private set; }
    }
}
