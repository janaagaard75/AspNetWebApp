module Muep {
    "use strict";

    export class Main {
        constructor() {
            this.setCanvasSize();
            Settings.initialize();
            this.game = new Game(this.isInDemoMode());
            this.canvas = new Canvas(this.game);
            this.gameHub = new GameHub();

            // TODO: Choose between Web API methods or SignalR.

            this.updatePlayerColor(); 
            //this.updateGameState();
            
            //GameService.getCurrentPlayer().then(() => {
            //    // Calling getGameInstance after getCurrentPlayer has returned to make sure that this player has been added.
            //    GameService.getGameInstance();
            //});
        }

        // TODO: Why are all the properties static? Will there ever be more than one instance of the Main class?
        private canvas: Canvas;
        private game: Game;
        private gameHub: GameHub;
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
            const canvasElement = document.getElementById(Settings.canvasId);
            canvasElement.style.width = canvasSize;
            canvasElement.style.height = canvasSize;
        }

        //private updateGameState() {
        //    console.info("Getting game instance. via SignalR.");
        //    const gameInstance = this.gameHub.server.getGame();
        //    console.info("Game instance received via SignalR.");
        //    console.info(gameInstance);
        //}

        private updatePlayerColor() {
            this.gameHub.getPlayerColor2().then(color => {
                console.info(`Player color: ${color}.`);
                this.playerColor = color;
            });
        }
    }
}
