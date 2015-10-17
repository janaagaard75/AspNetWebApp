module Muep {
    "use strict";

    export class GameService {
        public static getCurrentPlayer(): JQueryPromise<IPlayer> { // TODO: Return a Player object instead.
            return $.ajax({
                url: "api/currentplayer",
                dataType: "json"
            }).fail(error => {
                console.error("getCurrentPlayer error:", error);
            });
        }

        public static getGameInstance(): JQueryPromise<IGame> { // TODO: Return a Game object instead.
            return $.ajax({
                url: "/api/game",
                dataType: "json"
            }).then(gameData => {
                console.info(gameData);
                return gameData;
            }).fail(error => {
                console.error("getGameInstance error: ", error);
                return null;
            });
        }
    }
}
