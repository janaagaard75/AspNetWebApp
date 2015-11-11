module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            this.refreshGame();
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
            if (Main.game !== undefined && Main.game.started) {
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

        private getCanvasId(canvasNumber: number) {
            const canvasId = `${CanvasSettings.canvasIdTemplate}${canvasNumber}`;
            return canvasId;
        }

        public static printNumberOfMovesLeft() {
            const numberOfMovesLeft = Settings.movesPerTurn - Main.currentPlayer.numberOfMoveCommands;
            document.getElementById("numberOfMovesLeft").innerHTML = numberOfMovesLeft.toString();
            const movesElement = document.getElementById("moves");
            if (numberOfMovesLeft < 0) {
                movesElement.classList.add("label", "label-danger");
            } else {
                movesElement.classList.remove("label", "label-danger");
            }
        }

        private static printPlayersPoints() {
            var playersPoints = "";
            Main.game.players.forEach(player => {
                playersPoints += `<span class="label" style="background-color: ${player.color}; color: ${player.textColor}">${player.points}</span> `;
            });
            document.getElementById("playersPoints").innerHTML = playersPoints;
        }

        private static printPlayersStatus() {
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

        private refreshGame() {
            this.updateGameState().then(() => {
                this.canvas1 = new Canvas(Main.game.previousTurn, this.getCanvasId(1), false);
                this.canvas2 = new Canvas(Main.game.previousTurnWithPlaceCommands, this.getCanvasId(2), false);
                this.canvas3 = new Canvas(Main.game.previousTurnWithMoveCommands, this.getCanvasId(3), false);
                this.canvas4 = new Canvas(Main.game.currentTurn, this.getCanvasId(4), true);

                Utilities.getElement("playerColor").setAttribute("style", `background-color: ${Main.currentPlayer.color}`);

                const commandElements = document.getElementsByClassName("commands");
                for (let i = 0; i < commandElements.length; i++) {
                    commandElements[i].setAttribute("style", `width: ${CanvasSettings.width}px`);
                }

                if (Main.game.started) {
                    Utilities.enableElement("readyButton");
                    Utilities.getElement("startGameButton").setAttribute("title", "The game is already started.");

                    if (Main.currentPlayer.ready) {
                        Utilities.addClass("readyButton", "active");
                    } else {
                        Utilities.removeClass("readyButton", "active");
                    }
                } else {
                    Utilities.disableElement("readyButton");
                }

                Main.printNumberOfMovesLeft();
                Main.printPlayersStatus();
                Main.printPlayersPoints();

                this.setActiveBoard(4);

                const widthInPixels = `${CanvasSettings.width}px`;
                Utilities.getElement("playerCommands").style.width = widthInPixels;
                Utilities.getElement("administratorCommands").style.width = widthInPixels;

                window.setInterval(() => this.tick(), 1000);
            });
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
            if (Main.currentPlayer.ready) {
                Main.setCurrentPlayerNotReady();
            } else {
                const readyButtonElement = document.getElementById("readyButton");

                const exceeding = Main.currentPlayer.numberOfMoveCommands - Settings.movesPerTurn;
                if (exceeding > 0) {
                    alert(`Only up to ${Settings.movesPerTurn} moves are allowed. Please remove some moves and click the ready button again.`);
                    readyButtonElement.blur();
                    return;
                }

                readyButtonElement.classList.add("active");
                readyButtonElement.blur();

                this.sendCommands();
            }
        }

        public sendCommands() {
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
                    Main.printPlayersStatus();
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

        private static setCurrentPlayerNotReady() {
            const readyButtonElement = document.getElementById("readyButton");
            readyButtonElement.classList.remove("active");
            readyButtonElement.blur();
            GameService.notReady().then(() => {
                Main.currentPlayer.ready = false;
                Main.printPlayersStatus();
            });
        }

        public static setCurrentPlayerNotReadyIfNecessary() {
            if (Main.currentPlayer.ready) {
                Main.setCurrentPlayerNotReady();
            }
        }

        public startGame() {
            GameService.startGame().then(() => {
                this.refreshGame();
            });
        }

        public tick() {
            GameService.getStatus().then(status => {
                if (status.turnNumber !== Main.game.turnNumber) {
                    this.refreshGame();
                    return;
                }

                if (Main.game.started) {
                    // If the game has been started, update the players' ready status.
                    status.players.forEach(playerData => {
                        const player = Main.game.getPlayer(playerData.color);
                        player.ready = playerData.ready;
                    });
                } else {
                    // If the game hasn't been started yet, update the list of players.
                    if (status.players.length > Main.game.players.length) {
                        status.players.forEach(playerData => {
                            if (Main.game.getPlayer(playerData.color) === null) {
                                const player = new Player(playerData);
                                Main.game.players.push(player);
                            }
                        });
                        Main.printPlayersPoints();
                    }
                }

                Main.printPlayersStatus();
            });
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
