module Muep {
    "use strict";

    export abstract class Command {
        constructor(
            public type: CommandType,
            public unit: Unit
        ) {
            unit.command = this;
        }
    }
}
