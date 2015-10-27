module CocaineCartels {
    "use strict";

    export class PostMoveCommand {
        constructor(
            public from: Hex,
            public to: Hex
        ) { }
    }
}
