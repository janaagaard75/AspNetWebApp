module Muep {
    "use strict";

    /** Methods that the clients can call on the server. */
    export interface IGameServer {
        getGame: () => JQueryPromise<IGame>;
        getPlayerColor: () => JQueryPromise<string>;
    }
}
