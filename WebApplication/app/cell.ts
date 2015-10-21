module Muep {
    "use strict";

    export class Cell {
        /** Call initializeUnits for each cell after all cells have been initialized. */
        constructor(
            cellData: ICell
        ) {
            this.hex = new Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
            this.unitsData = cellData.units;
        }

        // TODO: Should either merge hovered and dropAllowed into an enum or make the hovering highlight elsewhere, so that both are possible.
        public dropAllowed = false;
        public hex: Hex;
        public hexagon: Konva.Shape;
        public hovered = false;
        public units: Unit[];

        /** unitsData is saved for use by the initializeUnits method. */
        private unitsData: IUnit[];

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

        public initializeUnits(gameInstance: Game) {
            this.units = [];
            this.unitsData.forEach(unitData => {
                // TODO: Fix this: When the unit is initialized the move commands are also. But that throws an exception because it's only after the unit has been initialized that it's added to the cell. One solution would be to include the cell in the constructor, but we also need units that aren't placed on any cells yet, so that might not be a good idea.
                const unit = new Unit(unitData, this);
                this.addUnit(unit);
            });
        }

        public get moveCommands(): MoveCommand[] {
            const moveCommands = this.units
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
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

            this.units = this.units.filter(u => u !== unit);
        }
    }
}
