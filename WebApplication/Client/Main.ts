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
                }

                this.printPlayersStatus();
                this.printPlayersPoints();

                if (Main.currentPlayer.administrator) {
                    document.getElementById("administratorCommands").classList.remove("hidden");
                } else {
                    document.getElementById("administratorCommands").classList.add("hidden");
                }

                this.setActiveBoard(4);

                document.getElementById("playerCommands").style.width = `${CanvasSettings.width}px`;

                window.setInterval(() => this.tick(), 1000);
            });
        }

        private canvas: Canvas;

        public activeBoard: number;

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

        private fetchAndUpdatePlayers(): Promise<void> {
            if (Main.game.started) {
                throw "Cannot update the players once the game has been started.";
            }

            return GameService.getPlayers().then(playersData => {
                if (playersData.length > Main.game.players.length) {
                    playersData.forEach(playerData => {
                        if (Main.game.getPlayer(playerData.color) === null) {
                            const player = new Player(playerData);
                            Main.game.players.push(player);
                        }
                    });
                    this.printPlayersStatus();
                    this.printPlayersPoints();
                }
            });
        }

        private fetchAndUpdatePlayersStatus(): Promise<void> {
            if (!Main.game.started) {
                throw "It does not make sense to update the player's status when the game hasn't been started.";
            }

            return GameService.getPlayers().then(playersData => {
                playersData.forEach(playerData => {
                    Main.game.getPlayer(playerData.color).ready = playerData.ready;
                });
                this.printPlayersStatus();
            });
        }

        public performTurn() {
            // Start by double checking that all players are ready. We still have a race condition issue, though.
            this.fetchAndUpdatePlayersStatus().then(() => {
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


        private printPlayersPoints() {
            var playersPoints = "";
            Main.game.players.forEach(player => {
                playersPoints += `<span class="label" style="background-color: ${player.color}">${player.points}</span> `;
            });
            document.getElementById("playersPoints").innerHTML = playersPoints;
        }

        private printPlayersStatus() {
            var playersStatus = "";
            Main.game.players.forEach(player => {
                if (player.ready) {
                    playersStatus += `<span class="label" style="background-color: ${player.color}">&nbsp;</span> `;
                } else {
                    playersStatus += `<span class="label label-default">&nbsp;</span> `;
                }
            });
            document.getElementById("playersStatus").innerHTML = playersStatus;
        }

        private reloadPage() {
            window.location.reload();
        }

        public resetGame() {
            GameService.resetGame().then(() => {
                this.reloadPage();
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
                    this.printPlayersStatus();
                    this.printPlayersPoints();
                })
                .catch(e => {
                    alert(`Error sending commands: ${e}.`);
                });
        }

        public setActiveBoard(activeBoard: number) {
            this.activeBoard = activeBoard;
            for (let i = 1; i <= 4; i++) {
                const buttonElement = document.getElementById(`boardButton${i}`);
                if (i === this.activeBoard) {
                    buttonElement.classList.add("active");
                } else {
                    buttonElement.classList.remove("active");
                }
            }
        }

        public startGame() {
            GameService.startGame().then(() => {
                this.reloadPage();
            });
        }

        public tick() {
            if (Main.game.started) {
                this.fetchAndUpdatePlayersStatus();
            } else {
                this.fetchAndUpdatePlayers();
            }
        }

        private updateGameState(): Promise<void> {
            return GameService.getGameState().then(gameState => {
                Main.game = gameState.gameInstance;
                Main.game.initializeGame();
                Main.currentPlayer = gameState.currentPlayer;
            });
        }
    }
}
