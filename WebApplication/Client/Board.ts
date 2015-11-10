module CocaineCartels {
    "use strict";

    export class Board {
        /** Call initializeUnits after the board has been initialized. */
        constructor(
            boardData: IBoard
        ) {
            // No units and commands initialized yet.
            this.cells = [];
            boardData.cells.forEach(cellData => {
                const cell = new Cell(cellData, this);
                this.cells.push(cell);
            });

            this.newUnits = [];
            boardData.newUnits.forEach(unitData => {
                const newUnit = new Unit(unitData, this, null);
                this.newUnits.push(newUnit);
            });

            this.gridSize = boardData.gridSize;
        }

        public cells: Array<Cell>;
        public newUnits: Array<Unit>;
        public gridSize: number;

        public get moveCommands(): Array<MoveCommand> {
            const moveCommands = this.unitsOnBoard
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        /** Returns the list of units placed on the board, i.e. units to be placed on the board are not included. */
        public get unitsOnBoard(): Array<Unit> {
            const unitsDoubleArray = this.cells.map(cell => cell.units);
            const units = Utilities.flatten(unitsDoubleArray);
            return units;
        }

        public allowedCellsForMove(unit: Unit): Array<Cell> {
            if (unit.cell == null) {
                throw "It's not allowed to move a cell that is not already on the board.";
            }

            const allowedCells = this.cells.filter(cell => {
                const allowed = cell.distance(unit.cell) <= unit.maximumMoveDistance;
                return allowed;
            });

            return allowedCells;
        }

        public allowedCellsForPlace(unit: Unit): Array<Cell> {
            const cellsWithUnits = this.cells.filter(cell => {
                const cellHasUnitsBelongingToCurrentPlayer = cell.units
                    .filter(u => u.moveCommand === null)
                    .filter(u => u.player === unit.player)
                    .length > 0;

                return cellHasUnitsBelongingToCurrentPlayer;
            });

            const moveFromCells = this.moveCommands
                .filter(mc => mc.unit.player === unit.player)
                .map(mc => mc.from);

            const allowedCells = Utilities.union(cellsWithUnits, moveFromCells);
            return allowedCells;
        }

        public getCell(hex: IHex): Cell {
            const cell = this.cells.filter(c => { return c.hex.equals(hex); })[0];
            return cell;
        }

        public getMoveCommands(from: Cell, to: Cell): Array<MoveCommand> {
            const moveCommands = this.moveCommands.filter(moveCommand => moveCommand.from === from && moveCommand.to === to);
            return moveCommands;
        }

        public nearestCell(pos: Konva.Vector2d): Cell {
            var minDist: number = null;
            var nearestCell: Cell;
            this.cells.forEach(cell => {
                var dist = cell.hex.pos.distance(pos);
                if (dist < minDist || minDist === null) {
                    minDist = dist;
                    nearestCell = cell;
                }
            });

            return nearestCell;
        }

        public newUnitsForPlayer(player: Player): Array<Unit> {
            const newUnits = this.newUnits.filter(u => u.player.color === player.color);
            return newUnits;
        }

        public placeUnit(unit: Unit, on: Cell) {
            if (unit.cell !== null) {
                throw "The unit is already placed on a cell.";
            }

            on.addUnit(unit);
        }
    }
}
