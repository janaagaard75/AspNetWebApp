module CocaineCartels {
    "use strict";

    export class Cell {
        constructor(
            cellData: ICell
        ) {
            this.cellData = cellData;
            this.hex = new Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
        }

        private cellData: ICell;
        private _units: Unit[] = undefined;

        public dropAllowed = false;
        public hex: Hex;
        public hexagon: Konva.Shape;
        public hovered = false;

        public get moveCommands(): MoveCommand[] {
            const moveCommands = this.units
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        public get units(): Unit[] {
            if (this._units === undefined) {
                this._units = [];
                this.cellData.units.forEach(unitData => {
                    const unit = new Unit(unitData, this);
                    this.addUnit(unit);
                });
            }

            return this._units;
        }

        public addUnit(unit: Unit) {
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
                if (u.moveCommand !== null) {
                    throw "Cannot remove unit since it has a move command assigned to it.";
                } else if (u.placeCommand !== null) {
                    throw "Cannot remove unit since it has a place command assigned to it.";
                }

                u.cell = null;
            });

            this._units = this.units.filter(u => u !== unit);
        }
    }
}
