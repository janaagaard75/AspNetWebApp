module CocaineCartels {
    "use strict";

    export interface IGame {
        players: Array<IPlayer>;

        /** Null on first turn. */
        previousTurn: ITurn;

        /** Null on first turn. */
        previousTurnShowingMoveCommands: ITurn;

        /** Null on first turn. */
        previousTurnShowingPlaceCommands: ITurn;

        started: boolean;

        turnMode: TurnMode;

        turnNumber: number;
    }
}
