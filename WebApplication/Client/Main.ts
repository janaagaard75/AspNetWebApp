module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            if (this.isInDemoMode()) {
                // TODO j: Add a demo mode parameter to the call to the server.
                return;
            }

            this.updatePlayerColor().then(() => {
                this.updateGameState().then(() => {
                    this.canvas = new Canvas(Main.game);
                });
            });
        }

        private canvas: Canvas;
        private playerColor: string;

        public static game: Game;

        private isInDemoMode(): boolean {
            const paramters = Utilities.getUrlParameters();
            const mode = paramters["mode"];
            const inDemoMode = mode === "demo";
            return inDemoMode;
        }

        private updateGameState(): Promise<void> {
            return GameService.getGameState().then(game => {
                Main.game = game;
                Main.game.initializeGame();
            });
        }

        private updatePlayerColor(): Promise<void> {
            return GameService.getCurrentPlayer().then(color => {
                this.playerColor = color;
            });
        }
    }
}
