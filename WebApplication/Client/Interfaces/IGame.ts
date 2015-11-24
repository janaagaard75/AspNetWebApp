module CocaineCartels {
    "use strict";

    export interface IGame {
        players: Array<IPlayer>;

        /** Null on first turn. */
        previousTurnShowingPlaceCommands: ITurn;

        started: boolean;
    }
}
