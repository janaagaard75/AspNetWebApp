module CocaineCartels {
    "use strict";

    export interface IGame {
        board: IBoard;
        newUnits: Array<Unit>;
        players: Array<IPlayer>;
    }
}
