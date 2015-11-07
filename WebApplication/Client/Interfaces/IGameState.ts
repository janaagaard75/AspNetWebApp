module CocaineCartels {
    "use strict";

    export interface IGameState {
        currentPlayerColor: string;
        currentTurn: IBoard;
        gameInstance: IGame;
    }
}
