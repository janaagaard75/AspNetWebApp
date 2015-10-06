module Muep {
    "use strict";

    export class Cell {
        constructor(
            public hex: Hex
        ) {
            this.units = [];
        }

        public units: Unit[];

        public addUnit(unit: Unit) {
            if (this.units.filter(u => u === unit).length > 0) {
                throw "The unit is already on the cell.";
            }

            this.units.push(unit);
            unit.cell = this;
        }

        public removeUnit(unit: Unit) {
            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                u.cell = null;
            });

            this.units = this.units.filter(u => u !== unit);
        }
    }
}
