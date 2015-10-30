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
                    document.getElementById("gameStarted").innerHTML = Main.game.started.toString();
                });
            });
        }

        private canvas: Canvas;
        private playerColor: string;

        // TODO j: Why is this static, but playerColor is not?
        public static game: Game;

        private isInDemoMode(): boolean {
            const paramters = Utilities.getUrlParameters();
            const mode = paramters["mode"];
            const inDemoMode = mode === "demo";
            return inDemoMode;
        }

        public sendCommands() {
            const units = Main.game.unitsOnBoard.filter(unit => unit.player.color === this.playerColor);

            const moveCommands = units
                .filter(unit => unit.moveCommand !== null)
                .map(unit => new PostMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex));

            const placeCommands = units
                .filter(unit => unit.placeCommand !== null)
                .map(unit => new PostPlaceCommand(unit.placeCommand.on.hex));

            const commands = new PostCommands(moveCommands, placeCommands, this.playerColor);

            GameService.postCommands(commands)
                .then(() => {
                    console.info("Commands sent without errors.");
                })
                .catch(e => {
                    console.info("Error sending commands.", e);
                });
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

        public resetGame() {
            GameService.getResetGame().then(() => {
                window.location.reload();
            });
        }
        
        // TODO j: Remove this method when it's done on the server.
        public simularCombat() {
            Main.game.simulateCombat();
            this.canvas.drawGame();
        }

        // TODO j: Remove this method when it's done on the server.
        public simulateMove() {
            Main.game.simulateMove();
            this.canvas.drawGame();
        }

        public startGame() {
            GameService.getStartGame().then(() => {
                window.location.reload();
            });
        }
    }
}
