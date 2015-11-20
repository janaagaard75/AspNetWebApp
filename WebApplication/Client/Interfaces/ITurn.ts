module CocaineCartels {
    "use strict";

    export interface ITurn {
        allianceProposals: Array<IAllianceProposal>;
        alliances: IAlliances;
        cells: Array<ICell>;
        mode: TurnMode;
        newUnits: Array<IUnit>;
        turnNumber: number;
    }
}
