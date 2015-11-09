module CocaineCartels {
    "use strict";

    export class ClientCommands {
        constructor(
            public moveCommands: Array<ClientMoveCommand>,
            public placeCommands: Array<ClientPlaceCommand>
        ) { }
    }
}
