module CocaineCartels {
    "use strict";

    export class UnitsToDisplay {
        constructor(
            public unitsOnThisCell: Array<Unit>,
            public unitsToBeMovedHere: Array<Unit>
        ) { }

        public get numberOfUnits(): number {
            const number = this.unitsOnThisCell.length + this.unitsToBeMovedHere.length;
            return number;
        }
    }
}
