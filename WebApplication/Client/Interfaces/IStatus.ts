module CocaineCartels {
    "use strict";

    export interface IStatus {
        currentPlayer: IPlayer;
        players: Array<IPlayer>;
        turnNumber: number;
    }
}
