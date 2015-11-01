﻿using System.Collections.Generic;
using System.Linq;

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

        public readonly IEnumerable<Cell> Cells;
        public readonly int GridSize;

        internal Cell GetCell(Hex hex)
        {
            Cell cell = Cells.First(c => c.Hex.Equals(hex));
            return cell;
        }

        internal IEnumerable<Unit> GetUnits()
        {
            return Cells.SelectMany(cell => cell.Units);
        }

        /// <summary>Resolve combats on cells.</summary>
        internal void Fight()
        {
            Cells.ForEach(cell =>
            {
                cell.Fight();
            });
        }
    }
}
