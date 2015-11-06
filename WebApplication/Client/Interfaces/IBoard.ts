module CocaineCartels {
    "use strict";

    export interface IBoard {
        cells: Array<ICell>;
        gridSize: number;
        newUnits: Array<IUnit>;
    }
}
