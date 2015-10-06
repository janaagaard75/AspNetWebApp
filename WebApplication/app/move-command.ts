module Muep {
    "use strict";

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
