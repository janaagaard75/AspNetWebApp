module CocaineCartels {
    "use strict";

    export abstract class Command {
        constructor(
            public type: CommandType,
            public unit: Unit
        ) {
            if (unit == null) {
                throw "'unit' must be defined.";
            }
        }
    }
}
