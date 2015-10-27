module CocaineCartels {
    "use strict";

    export class PostCommands {
        constructor(
            public moveCommands: Array<PostMoveCommand>,
            public placeCommands: Array<PostPlaceCommand>,
            public playerColor: string
        ) { }
    }
}
