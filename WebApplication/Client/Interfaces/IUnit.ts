module CocaineCartels {
    "use strict";

    export interface IUnit {
        killed: boolean;
        moveCommand: IServerMoveCommand;
        newUnit: boolean;
        placeCommand: IServerPlaceCommand;
        player: IPlayer;
    }
}
