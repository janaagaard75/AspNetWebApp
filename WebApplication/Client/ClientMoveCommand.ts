module CocaineCartels {
    "use strict";

    export class ClientMoveCommand {
        constructor(
            public from: Hex,
            public to: Hex
        ) { }
    }
}
