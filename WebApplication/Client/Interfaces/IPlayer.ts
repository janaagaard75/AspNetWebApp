module CocaineCartels {
    "use strict";

    export interface IPlayer {
        /** The color is also the ID of the player. */
        allianceProposals: Array<string>;
        color: string;
        commandsSentOn: string;
        points: number;
        pointsLastTurn: number;
        ready: boolean;
        textColor: string;
    }
}
