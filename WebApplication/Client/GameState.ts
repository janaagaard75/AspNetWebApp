module CocaineCartels {
    "use strict";

    export class GameState {
        constructor(
            gameStateData: IGameState
        ) {
            this.gameInstance = new Game(gameStateData.currentTurn, gameStateData.gameInstance);
            this.currentPlayer = this.gameInstance.getPlayer(gameStateData.currentPlayerColor);
        }

        public currentPlayer: Player;
        public gameInstance: Game;
    }
}
