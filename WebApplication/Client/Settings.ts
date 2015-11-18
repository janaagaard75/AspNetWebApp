module CocaineCartels {
    "use strict";

    declare var serverSideSettings: any;

    export class Settings {
        public static alliancesSystem: AlliancesSystem = serverSideSettings.AlliancesSystem;
        public static gridSize: number = serverSideSettings.GridSize;
        public static movesPerTurn: number = serverSideSettings.MovesPerTurn;
    }
}
