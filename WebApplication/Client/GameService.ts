module CocaineCartels {
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
                return gameState;
            });
        }

        public static postCommands(commands: PostCommands): Promise<void> {
            return HttpClient.post<void>("/api/commands", commands);
        }
    }
}
