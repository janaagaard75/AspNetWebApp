module CocaineCartels {
    "use strict";

    export class MoveCommand extends Command {
        constructor(
            public unit: Unit,
            public from: Cell
        ) {
            super(CommandType.MoveCommand, unit);

            if (unit.cell === null) {
                throw "Can only assign move commands to units that are assigned to a cell.";
            }
        }

        public get to(): Cell {
            return this.unit.cell;
        }
    }
}
