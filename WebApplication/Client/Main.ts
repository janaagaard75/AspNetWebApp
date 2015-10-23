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

        // TODO j: This method is not used. Should the size code be move in here, or should this method be deleted?
        private setCanvasSize() {
            const minSize = Math.min(window.innerWidth, window.innerHeight);
            const canvasSize = `${minSize}px`;
            const canvasElement = document.getElementById(CanvasSettings.canvasId);
            canvasElement.style.width = canvasSize;
            canvasElement.style.height = canvasSize;
        }

        private updateGameState(): Promise<void> {
            return GameService.getGameState().then(game => {
                Main.game = game;
            });
        }

        private updatePlayerColor(): Promise<void> {
            return GameService.getCurrentPlayer().then(color => {
                this.playerColor = color;
            });
        }
    }
}
