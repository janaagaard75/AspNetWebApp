module Muep {
    "use strict";

    export class GameService {
        public static getCurrentPlayer(): JQueryPromise<Player> {
            return $.ajax({
                    url: "api/currentplayer",
                    dataType: "json"
                })
                .then(playerData => {
                    const player = new Player(playerData);
                    return player;
                })
                .fail(error => {
                    console.error("getCurrentPlayer error:", error);
                });
        }

        
        public static getGameState(): JQueryPromise<Game> {
            return $.ajax({
                    url: "/api/gamestate",
                    dataType: "json"
                })
                .then(gameData => {
                    console.info(gameData);
                    const game = new Game(gameData);
                    return game; // TODO: Why doesn't TypeScript complain if the type of game isn't Game? Is this because of jQuery promises? See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise#Example_using_new_XMLHttpRequest()
                })
                .fail(error => {
                    console.error("getGameState error: ", error);
                    return null;
                });
        }
    }
}
