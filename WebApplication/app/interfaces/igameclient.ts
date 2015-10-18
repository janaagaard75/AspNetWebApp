module Muep {
    "use strict";

    /** Methods that the server can call on the clients. */
    export interface IGameClient {
        playerJoined: (color: string) => void; // TODO: Implement.
        setPlayerColor: (color: string) => void; // TODO: Remove once GetGame has been implemented.
    }
}
