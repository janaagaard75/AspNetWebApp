module Muep {
    "use strict";

    export class Main {
        constructor() {
            this.setCanvasSize();
           if (this.isInDemoMode()) {
                //this.game = new Game();
                //DemoSetup.addUnitsAndCommands(this.game);
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
