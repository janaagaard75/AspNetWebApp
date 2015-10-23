module CocaineCartels {
    "use strict";

    export interface IGame {
        board: IBoard;
        newUnits: Array<IUnit>;
        players: Array<IPlayer>;
    }
}
