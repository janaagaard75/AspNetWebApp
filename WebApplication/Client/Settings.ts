module CocaineCartels {
    "use strict";

    declare var serverSideSettings: any;

    export class Settings {
        public static gridSize: number = serverSideSettings.GridSize;
        public static movesPerTurn: number = serverSideSettings.MovesPerTurn;
        public static newUnitPerCellsControlled: number = serverSideSettings.NewUnitPerCellsControlled;
        public static newUnitsPerTurn: number = serverSideSettings.NewUnitsPerTurn;
    }
}
