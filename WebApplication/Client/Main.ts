module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            this.updateGameState().then(() => {
                this.canvas1 = new Canvas(Main.game.previousTurn, this.getCanvasId(1), false);
                this.canvas2 = new Canvas(Main.game.previousTurnWithPlaceCommands, this.getCanvasId(2), false);
                this.canvas3 = new Canvas(Main.game.previousTurnWithMoveCommands, this.getCanvasId(3), false);
                this.canvas4 = new Canvas(Main.game.currentTurn, this.getCanvasId(4), true);

                const playerColor = document.getElementById("playerColor");
                playerColor.setAttribute("style", `background-color: ${Main.currentPlayer.color}`);

                const commandElements = document.getElementsByClassName("commands");
                for (let i = 0; i < commandElements.length; i++) {
                    commandElements[i].setAttribute("style", `width: ${CanvasSettings.width}px`);
                }

                if (Main.game.started) {
                    document.getElementById("readyButton").removeAttribute("disabled");
                    document.getElementById("startGameButton").setAttribute("disabled", "disabled");
                    document.getElementById("startGameButton").setAttribute("title", "The game is already started.");
                } else {
                    document.getElementById("readyButton").setAttribute("disabled", "disabled");
                }

                this.printPlayersStatus();
                this.printPlayersPoints();

                if (Main.currentPlayer.administrator) {
                    document.getElementById("administratorCommands").classList.remove("hidden");
                } else {
                    document.getElementById("administratorCommands").classList.add("hidden");
                }

                this.setActiveBoard(4);

                const widthInPixels = `${CanvasSettings.width}px`;
                document.getElementById("playerCommands").style.width = widthInPixels;
                document.getElementById("administratorCommands").style.width = widthInPixels;

                window.setInterval(() => this.tick(), 1000);
            });
        }

        private canvas1: Canvas;
        private canvas2: Canvas;
        private canvas3: Canvas;
        private canvas4: Canvas;

        public activeBoard: number;

        // Static to make them available in other classes.
        public static currentPlayer: Player;
        public static game: Game;

        private allPlayersAreReady(): boolean {
            const playersWhoAreNotReady = Main.game.players.filter(player => !player.ready).length;
            return playersWhoAreNotReady === 0;
        }

        public confirmResetGame() {
            if (Main.game.started) {
                if (!window.confirm("Sure you want to reset the game?")) {
                    return;
                }
            }

            this.resetGame();
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
                    this.reloadPage();
                });
            });
        }

        private getCanvasId(canvasNumber: number) {
            const canvasId = `${CanvasSettings.canvasIdTemplate}${canvasNumber}`;
            return canvasId;
        }

        private printPlayersPoints() {
            var playersPoints = "";
            Main.game.players.forEach(player => {
                playersPoints += `<span class="label" style="background-color: ${player.color}; color: ${player.textColor}">${player.points}</span> `;
            });
            document.getElementById("playersPoints").innerHTML = playersPoints;
        }

        private printPlayersStatus() {
            var playersStatus = "";
            Main.game.players.forEach(player => {
                if (player.ready) {
                    playersStatus += `<span class="label" style="background-color: ${player.color}; color: ${player.textColor}">&nbsp;</span> `;
                } else {
                    playersStatus += `<span class="label label-default">&nbsp;</span> `;
                }
            });
            document.getElementById("playersStatus").innerHTML = playersStatus;
        }

        private reloadPage() {
            window.location.reload();
        }

        private resetGame() {
            GameService.resetGame().then(() => {
                this.reloadPage();
            });
        }

        public readyButtonClick() {
            const readyButtonElement = document.getElementById("readyButton");
            if (Main.currentPlayer.ready) {
                readyButtonElement.classList.remove("active");
                readyButtonElement.blur();
                GameService.notReady().then(() => {
                    Main.currentPlayer.ready = false;
                    this.printPlayersStatus();
                });
            } else {
                readyButtonElement.classList.add("active");
                readyButtonElement.blur();
                this.sendCommands();
            }
        }

        public sendCommands() {
            const exceeding = Main.currentPlayer.numberOfMoveCommands - Settings.movesPerTurn;
            if (exceeding > 0) {
                let commandText = "command";
                if (exceeding >= 2) {
                    commandText += "s";
                }
                alert(`Only up to ${Settings.movesPerTurn} moves are allowed. Please remove ${exceeding} ${commandText} and click Send Commands again.`);
                return;
            }

            const currentPlayersUnitsOnBoardOrToBePlacedOnBoard = Main.game.currentTurn.unitsOnBoardOrToBePlacedOnBoard.filter(unit => unit.player.color === Main.currentPlayer.color);

            const moveCommands = currentPlayersUnitsOnBoardOrToBePlacedOnBoard
                .filter(unit => unit.moveCommand !== null)
                .map(unit => new ClientMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex));

            const currentPlayersNewUnits = Main.game.currentTurn.newUnits.filter(unit => unit.player.color === Main.currentPlayer.color);

            const placeCommands = currentPlayersNewUnits
                .filter(unit => unit.placeCommand !== null)
                .map(unit => new ClientPlaceCommand(unit.placeCommand.on.hex));

            const commands = new ClientCommands(moveCommands, placeCommands);

            GameService.sendCommands(commands)
                .then(() => {
                    // This might cause a blinking of the player's status if there is currently a status update in the pipeline.
                    Main.currentPlayer.ready = true;
                    this.printPlayersStatus();
                })
                .catch(e => {
                    alert(`Error sending commands: ${e}.`);
                });
        }

        public setActiveBoard(activeBoard: number) {
            this.activeBoard = activeBoard;

            for (let i = 1; i <= 4; i++) {
                const canvasElement = document.getElementById(this.getCanvasId(i));
                const buttonElement = document.getElementById(`boardButton${i}`);

                if (i === this.activeBoard) {
                    canvasElement.classList.remove("hidden");
                    buttonElement.classList.add("active");
                } else {
                    canvasElement.classList.add("hidden");
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
                Main.game.initializeBoard(Main.game.previousTurn);
                Main.game.initializeBoard(Main.game.previousTurnWithPlaceCommands);
                Main.game.initializeBoard(Main.game.previousTurnWithMoveCommands);
                Main.game.initializeBoard(Main.game.currentTurn);
                Main.currentPlayer = gameState.currentPlayer;
            });
        }
    }
}
