module Muep {
    "use strict";

    export interface IGameClient {
        playerJoined: (color: string) => void; // TODO: Implement.
        setPlayerColor: (color: string) => void;
    }
}
