module Muep {
    "use strict";

    export interface IUnit {
        moveCommand: IMoveCommand;
        placeCommand: IPlaceCommand;
        playerColor: string;
    }
}
