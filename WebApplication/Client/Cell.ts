module CocaineCartels {
    "use strict";

    export class Cell {
        constructor(
            cellData: ICell
        ) {
            this._cellData = cellData;
            this.hex = new Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
        }

        private _cellData: ICell;
        private _units: Array<Unit> = undefined;

        public dropAllowed = false;
        public hex: Hex;
        public hexagon: Konva.Shape;
        public hovered = false;

        public get moveCommandsFromCell(): Array<MoveCommand> {
            const moveCommands = this.units
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        public get moveCommandsToCell(): Array<MoveCommand> {
            const commands = Main.game.moveCommands.filter(moveCommand => moveCommand.to === this);
            return commands;
        }

        public get units(): Array<Unit> {
            if (this._units === undefined) {
                this._units = [];
                this._cellData.units.forEach(unitData => {
                    const unit = new Unit(unitData, this);
                    this.addUnit(unit);
                });
            }

            return this._units;
        }

        public get unitsToDisplay(): UnitsToDisplay {
            const unitsOnThisCell = this.units.filter(unit => unit.moveCommand === null);
            const unitsToBeMovedToThisCell = this.moveCommandsToCell.map(command => command.unit);
            return new UnitsToDisplay(unitsOnThisCell, unitsToBeMovedToThisCell);
        }

        // TODO j: Need an array of units to display on this cell. That would be units on this cell not being moved out and units on other cells being moved to this cell.

        public addUnit(unit: Unit) {
            // TODO j: Fail if this unit is already placed on another cell.

            if (this.units.filter(u => u === unit).length > 0) {
                throw "The unit is already on the cell.";
            }

            this.units.push(unit);
            unit.cell = this;
        }

        /** Returns the Manhatten distance between this cell and another cell. See http://www.redblobgames.com/grids/hexagons/#distances */
        public distance(other: Cell): number {
            const distance = Math.max(
                Math.abs(this.hex.r - other.hex.r),
                Math.abs(this.hex.s - other.hex.s),
                Math.abs(this.hex.t - other.hex.t));

            return distance;
        }

        public removeUnit(unit: Unit) {
            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                u.cell = null;
            });

            this._units = this.units.filter(u => u !== unit);
        }
    }
}
