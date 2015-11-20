module CocaineCartels {
    "use strict";

    export interface ITurn {
        cells: Array<ICell>;
        mode: TurnMode;
        newUnits: Array<IUnit>;
        turnNumber: number;
    }
}
