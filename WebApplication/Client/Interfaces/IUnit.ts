module CocaineCartels {
    "use strict";

    export interface IUnit {
        moveCommand: IServerMoveCommand;
        newUnit: boolean;
        placeCommand: IServerPlaceCommand;
        player: IPlayer;
    }
}
