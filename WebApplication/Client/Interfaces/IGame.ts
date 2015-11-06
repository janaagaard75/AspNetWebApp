module CocaineCartels {
    "use strict";

    export interface IGame {
        board: IBoard;
        players: Array<IPlayer>;
        started: boolean;
    }
}
