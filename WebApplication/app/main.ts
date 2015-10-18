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

            // Welcome to callback hell.
            this.updatePlayerColor()
                .then(() => {
                    this.updateGameState()
                        .then(() => {
                            this.canvas = new Canvas(this.game);
                        });
                });
        }

        private canvas: Canvas;
        private game: Game;
        private playerColor: string;

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

        private updateGameState(): JQueryPromise<void> {
            return GameService.getGameState().then(game => {
                // TODO: If the game state is ovewritten, then the canvas also has to be built again because these two are closely linked.
                this.game = game;
            });
        }

        private updatePlayerColor(): JQueryPromise<void> {
            return GameService.getCurrentPlayer().then(player => {
                this.playerColor = player.color;
            });
        }
    }
}
