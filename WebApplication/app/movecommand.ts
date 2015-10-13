module Muep {
    "use strict";

    // TODO: A move command should only have a from cell, since the unit is located in the to cell.
    export class MoveCommand extends Command {
        constructor(
            public unit: Unit,
            public from: Cell,
            public to: Cell
        ) {
            super(CommandType.MoveCommand, unit);
        }
    }
}
