using System.Collections.Generic;
using System.Linq;

namespace CocaineCartels.BusinessLogic
{
    public class Turn
    {
        public Turn(int gridSize)
        {
            AllianceProposals = new HashSet<AllianceProposal>();
            Alliances = new Alliances();
            Cells = InitializeCells(gridSize);
            ResetNewUnits();
            TurnNumber = 0;
        }

        public HashSet<AllianceProposal> AllianceProposals { get; }
        public Alliances Alliances { get; } 
        public IEnumerable<Cell> Cells { get; }
        public TurnMode Mode { get; set; }
        public List<Unit> NewUnits { get; private set; }
        /// <summary>TurnNumber is 0 when the game hasn't been started yet.</summary>
        public int TurnNumber { get; private set; }

        internal IEnumerable<Unit> AllUnits
        {
            get
            {
                var allUnits = UnitsOnCells.Concat(NewUnits);
                return allUnits;
            }
        } 

        internal IEnumerable<Unit> UnitsOnCells
        {
            get { return Cells.SelectMany(cell => cell.Units); }
        }

        internal void AddNewUnitsToPlayer(Player player, int numberOfNewUnits)
        {
            for (int i = 0; i < numberOfNewUnits; i++)
            {
                var unit = new Unit(player);
                NewUnits.Add(unit);
            }
        }

        internal Cell GetCell(Hex hex)
        {
            Cell cell = Cells.First(c => c.Hex.Equals(hex));
            return cell;
        }

        /// <summary>Resolve combats on cells.</summary>
        internal void Fight()
        {
            Cells.ForEach(cell =>
            {
                cell.Fight();
            });
        }

        public void IncreaseTurnNumber()
        {
            TurnNumber++;
        }

        private IEnumerable<Cell> InitializeCells(int gridSize)
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

            return cells;
        }

        public int NumberOfControlledCells(Player player)
        {
            int numberOfCells = Cells.Count(cell => cell.Units.Any(unit => unit.Player.Equals(player)));
            return numberOfCells;
        }

        internal void ResetNewUnits()
        {
            NewUnits = new List<Unit>();
        }
    }
}
