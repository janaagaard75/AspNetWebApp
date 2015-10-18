module Muep {
    "use strict";

    /** Messages that the clients can call on the server. */
    export interface IGameServer {
        getGame(): IGame;
        getPlayerColor: () => JQueryPromise<string>;
    }
}
