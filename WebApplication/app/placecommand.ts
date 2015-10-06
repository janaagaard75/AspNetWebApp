module Muep {
    "use strict";

    export class PlaceCommand extends Command {
        constructor(
            public unit: Unit,
            public cell: Cell
        ) {
            super(CommandType.PlaceCommand, unit);
        }
    }
}
