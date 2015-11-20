module CocaineCartels {
    "use strict";

    export class ClientCommands {
        constructor(
            public allianceProposals: Array<ClientAllianceProposal>,
            public moveCommands: Array<ClientMoveCommand>,
            public placeCommands: Array<ClientPlaceCommand>
        ) { }
    }
}
