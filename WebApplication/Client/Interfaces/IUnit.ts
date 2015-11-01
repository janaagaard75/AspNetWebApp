module CocaineCartels {
    "use strict";

    export interface IUnit {
        moveCommand: IServerMoveCommand;
        placeCommand: IServerPlaceCommand;
        player: IPlayer;
    }
}
