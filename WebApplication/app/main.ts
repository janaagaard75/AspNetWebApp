module Muep {
    "use strict";

    export class Main {
        constructor() {
            this.setCanvasSize();
            Settings.initialize();
            Main.game = new Game(this.isInDemoMode());
            Main.canvas = new Canvas(Main.game);

            this.updatePlayerColor();
        }

        private static canvas: Canvas;
        private static game: Game;
        private static playerColor: string;

        private getMode(): string {
            const paramters = Utilities.getUrlParameters();
            const mode = paramters["mode"];
            return mode;
        }

        private updatePlayerColor(): void {
            const gameHub = <IGameHub>$.connection.hub.proxies.gamehub;

            gameHub.client.setPlayerColor = color => {
                Main.playerColor = color;
                console.info(`Player color: ${color}.`);
            };

            gameHub.connection.start()
                .done(() => {
                    console.info("Started");
                    gameHub.server.getPlayerColor();
                })
                .fail(() => {
                    console.error("Connection failed.");
                });
        }

        private isInDemoMode(): boolean {
            const inDemoMode = this.getMode() === "demo";
            return inDemoMode;
        }

        private setCanvasSize() {
            const minSize = Math.min(window.innerWidth, window.innerHeight);
            const canvasSize = `${minSize}px`;
            const canvasElement = document.getElementById(Settings.canvasId);
            canvasElement.style.width = canvasSize;
            canvasElement.style.height = canvasSize;
        }
    }
}
