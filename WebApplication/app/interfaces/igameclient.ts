module Muep {
    "use strict";

    export interface IGameClient {
        playerJoined: (color: string) => void; // TODO: Implement.
        setUpGame: (game: IGame) => void; // TODO: Implement.
        setPlayerColor: (color: string) => void; // TODO: Replace with setUpGame.
    }
}
