module CocaineCartels {
    "use strict";

    export interface IGame {
        /** Never null. */
        currentTurn: IBoard;

        /** Never null. */
        players: Array<IPlayer>;

        /** Null on first turn. */
        previousTurn: IBoard;

        /** Null on first turn. */
        previousTurnShowingMoveCommands: IBoard;

        /** Null on first turn. */
        previousTurnShowingPlaceCommands: IBoard;

        /** Never null. */
        started: boolean;
    }
}
