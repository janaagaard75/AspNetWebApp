module CocaineCartels {
    "use strict";

    export interface IGameState {
        currentPlayerColor: string;
        currentTurn: ITurn;
        gameInstance: IGame;
    }
}
