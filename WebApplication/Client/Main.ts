module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            this.updatePlayerColor().then(() => {
                this.updateGameState().then(() => {
                    this.canvas = new Canvas(Main.game);

                    const playerColor = document.getElementById("playerColor");
                    playerColor.setAttribute("style", `background-color: ${Main.playerColor}`);

                    const commandElements = document.getElementsByClassName("commands");
                    for (let i = 0; i < commandElements.length; i++) {
                        commandElements[i].setAttribute("style", `width: ${CanvasSettings.width}px`);
                    }

                    if (Main.game.started) {
                        document.getElementById("startGameButton").setAttribute("disabled", "disabled");
                    } else {
                        document.getElementById("sendButton").setAttribute("disabled", "disabled");
                        document.getElementById("resetGameButton").setAttribute("disabled", "disabled");
                    }

                    this.updatePlayersStatus();
                });
            });
        }

        private canvas: Canvas;

        // Static to make them available in other classes.
        public static playerColor: string;
        public static game: Game;

        private allPlayersAreReady(): boolean {
            const playersWhoAreNotReady = Main.game.players.filter(player => !player.ready).length;
            return playersWhoAreNotReady > 0;
        }

        private isInDemoMode(): boolean {
            const paramters = Utilities.getUrlParameters();
            const mode = paramters["mode"];
            const inDemoMode = mode === "demo";
            return inDemoMode;
        }

        public performTurn() {
            if (!this.allPlayersAreReady()) {
                if (!confirm("Not all players are ready. Continue anyways?")) {
                    return;
                }
            }

            GameService.performTurn().then(() => {
                // TODO j: Use the returned game state instead of reloading the page.
                this.reloadPage();
            });
        }

        public sendCommands() {
            const exceeding = Main.game.numberOfMoveCommands - Settings.movesPerTurn;
            if (exceeding > 0) {
                var commandText = "command";
                if (exceeding >= 2) {
                    commandText += "s";
                }
                alert(`Only up to ${Settings.movesPerTurn} moves are allowed. Please remove ${exceeding} ${commandText} and click Send Commands again.`);
                return;
            }

            const units = Main.game.unitsOnBoard.filter(unit => unit.player.color === Main.playerColor);

            const moveCommands = units
                .filter(unit => unit.moveCommand !== null)
                .map(unit => new ClientMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex));

            const placeCommands = units
                .filter(unit => unit.placeCommand !== null)
                .map(unit => new ClientPlaceCommand(unit.placeCommand.on.hex));

            const commands = new ClientCommands(moveCommands, placeCommands, Main.playerColor);

            GameService.sendCommands(commands)
                .then(() => {
                    Main.game.getPlayer(Main.playerColor).ready = true;
                    this.updatePlayersStatus();
                })
                .catch(e => {
                    alert(`Error sending commands: ${e}.`);
                });
        }

        private reloadPage() {
            window.location.reload();
        }

        public resetGame() {
            GameService.resetGame().then(() => {
                this.reloadPage();
            });
        }

        public startGame() {
            GameService.startGame().then(() => {
                this.reloadPage();
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
                Main.playerColor = color;
            });
        }

        private updatePlayersStatus() {
            var playersStatus = "";
            Main.game.players.forEach(player => {
                if (player.ready) {
                    playersStatus += `<span class="color" style="background-color: ${player.color}"></span> `;
                } else {
                    playersStatus += `<span class="color"></span> `;
                }
            });
            document.getElementById("playersStatus").innerHTML = playersStatus;
        }
    }
}
