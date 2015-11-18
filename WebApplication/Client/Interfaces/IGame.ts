module CocaineCartels {
    "use strict";

    export interface IGame {
        players: Array<IPlayer>;

        /** Null on first turn. */
        previousTurn: IBoard;

        /** Null on first turn. */
        previousTurnShowingMoveCommands: IBoard;

        /** Null on first turn. */
        previousTurnShowingPlaceCommands: IBoard;

        started: boolean;

        turnMode: TurnMode;

        turnNumber: number;
    }
}
