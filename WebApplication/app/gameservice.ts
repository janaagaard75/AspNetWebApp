module Muep {
    "use strict";

    export class GameService {
        public static getCurrentPlayer(): Promise<Player> {
            return HttpClient.get<IPlayer>("/api/currentplayer").then(playerData => {
                const player = new Player(playerData);
                console.log(player);
                return player;
            });
        }

        public static getGameState(): Promise<Game> {
            return HttpClient.get<IGame>("/api/gamestate").then(gameData => {
                const gameState = new Game(gameData);
                console.log(gameState);
                return gameState;
            });
        }
    }
}
