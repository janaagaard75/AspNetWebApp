module Muep {
    "use strict";

    export class GameService {
        public static getCurrentPlayer(): Promise<string> {
            return HttpClient.get<string>("/api/currentplayercolor").then(color => {
                console.info(`Current player: ${color}.`);
                return color;
            });
        }

        public static getGameState(): Promise<Game> {
            return HttpClient.get<IGame>("/api/gamestate").then(gameData => {
                const gameState = new Game(gameData);
                console.info(gameState);
                return gameState;
            });
        }
    }
}
