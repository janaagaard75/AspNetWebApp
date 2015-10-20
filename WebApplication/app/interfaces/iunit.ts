module Muep {
    "use strict";

    export interface IUnit {
        moveCommand: IMoveCommand;
        placeCommand: IPlaceCommand;
        player: IPlayer;
    }
}
