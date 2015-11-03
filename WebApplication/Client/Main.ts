module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            this.updateGameState().then(() => {
                this.canvas = new Canvas(Main.game);

                const playerColor = document.getElementById("playerColor");
                playerColor.setAttribute("style", `background-color: ${Main.currentPlayer.color}`);

                const commandElements = document.getElementsByClassName("commands");
                for (let i = 0; i < commandElements.length; i++) {
                    commandElements[i].setAttribute("style", `width: ${CanvasSettings.width}px`);
                }

                if (Main.game.started) {
                    document.getElementById("sendButton").removeAttribute("disabled");
                    document.getElementById("startGameButton").setAttribute("disabled", "disabled");
                } else {
                    document.getElementById("sendButton").setAttribute("disabled", "disabled");
                    document.getElementById("resetGameButton").setAttribute("disabled", "disabled");
                }

                this.updatePlayersStatus();
                this.updatePlayersPoints();

                if (Main.currentPlayer.administrator) {
                    document.getElementById("administratorCommands").classList.remove("hidden");
                } else {
                    document.getElementById("administratorCommands").classList.add("hidden");
                }


            });
        }

        private canvas: Canvas;

        // Static to make them available in other classes.
        public static currentPlayer: Player;
        public static game: Game;

        private allPlayersAreReady(): boolean {
            const playersWhoAreNotReady = Main.game.players.filter(player => !player.ready).length;
            return playersWhoAreNotReady === 0;
        }

        private isInDemoMode(): boolean {
            const paramters = Utilities.getUrlParameters();
            const mode = paramters["mode"];
            const inDemoMode = mode === "demo";
            return inDemoMode;
        }

        public fetchPlayersStatus(): Promise<void> {
            return GameService.getPlayers().then(playersData => {
                playersData.forEach(playerData => {
                    Main.game.getPlayer(playerData.color).ready = playerData.ready;
                });
                this.updatePlayersStatus();
            });
        }

        public performTurn() {
            // TODO j: If all players are ready there is no need to start out making the server side call.
            this.fetchPlayersStatus().then(() => {
                if (!this.allPlayersAreReady()) {
                    if (!confirm("Not all players are ready. Continue anyways?")) {
                        return;
                    }
                }

                GameService.performTurn().then(() => {
                    // TODO j: Use the returned game state instead of reloading the page.
                    this.reloadPage();
                });
            });
        }

        public sendCommands() {
            const exceeding = Main.currentPlayer.numberOfMoveCommands - Settings.movesPerTurn;
            if (exceeding > 0) {
                var commandText = "command";
                if (exceeding >= 2) {
                    commandText += "s";
                }
                alert(`Only up to ${Settings.movesPerTurn} moves are allowed. Please remove ${exceeding} ${commandText} and click Send Commands again.`);
                return;
            }

            const units = Main.game.unitsOnBoard.filter(unit => unit.player.color === Main.currentPlayer.color);

            const moveCommands = units
                .filter(unit => unit.moveCommand !== null)
                .map(unit => new ClientMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex));

            const placeCommands = units
                .filter(unit => unit.placeCommand !== null)
                .map(unit => new ClientPlaceCommand(unit.placeCommand.on.hex));

            const commands = new ClientCommands(moveCommands, placeCommands, Main.currentPlayer.color);

            GameService.sendCommands(commands)
                .then(() => {
                    Main.game.getPlayer(Main.currentPlayer.color).ready = true;
                    this.updatePlayersStatus();
                    this.updatePlayersPoints();
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
            return GameService.getGameState().then(gameState => {
                Main.game = gameState.gameInstance;
                Main.game.initializeGame();
                Main.currentPlayer = gameState.currentPlayer;
            });
        }

        private updatePlayersPoints() {
            var playersPoints = "";
            Main.game.players.forEach(player => {
                playersPoints += `<span class="points" style="border-color: ${player.color}">${player.points}</span> `;
            });
            document.getElementById("playersPoints").innerHTML = playersPoints;
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
