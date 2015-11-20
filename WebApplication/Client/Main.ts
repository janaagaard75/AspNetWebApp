module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            CanvasSettings.initialize(Settings.gridSize);
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

        public allPlayersSeemToBeHereClicked() {
            Main.currentPlayer.ready = !Main.currentPlayer.ready;
            GameService.setAllPlayersSeemToBeHere(Main.currentPlayer.ready);

            if (Main.currentPlayer.ready) {
                $("#allPlayersSeemToBeHereButton").addClass("active");
            } else {
                $("#allPlayersSeemToBeHereButton").removeClass("active");
            }

            this.printStartPlayersReady();
        }

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

        private static getPlayerLabel(player: Player, emptyIfNotReady: boolean): string {
            if (emptyIfNotReady && !player.ready) {
                return `<span class="label label-border" style="border-color: ${player.color};">&nbsp;&nbsp;&nbsp;</span>`;
            } else {
                return `<span class="label label-border" style="border-color: ${player.color}; background-color: ${player.color};">&nbsp;&nbsp;&nbsp;</span>`;
            }
        }

        private static getTurnModeString(turnMode: TurnMode): string {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.PlanMoves:
                    return "Plan moves";

                case TurnMode.ProposeAlliances:
                    return "Propose alliances";

                case TurnMode.StartGame:
                    return "Start game lobby";

                default:
                case TurnMode.Undefined:
                    return "Unknown";
            }
        }

        private static printAllAlliances() {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.ProposeAlliances:
                    const allAlliances = Main.game.currentTurn.alliances.alliancePairs
                        .map(pair => {
                            return `<div><span style="color: ${pair.playerA}">${pair.playerA}</span> & <span style="color: ${pair.playerB}">${pair.playerB}</span></div>`;
                        });

                    let allAlliancesText: string;
                    if (allAlliances.length >= 1) {
                        allAlliancesText = allAlliances.join(" ");
                    } else {
                        allAlliancesText = "No players were allied.";
                    }

                    $("#allAlliancesList").html(allAlliancesText);
                    $("#allAlliances").removeClass("hidden");
                    break;

                default:
                    $("#allAlliances").addClass("hidden");
            }
        }

        private static printAllianceCheckboxes() {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.ProposeAlliances:
                    const allOtherPlayers = Main.game.players.filter(p => p !== Main.currentPlayer);
                    const allianceCheckboxes = allOtherPlayers
                        .map(player => {
                            const playerButton = `<div class="checkbox"><label><input type="checkbox" value="${player.color}" onclick="cocaineCartels.toggleProposeAllianceWith();" class="jsAllianceProposal" /> <span style="color: ${player.color}">${player.name}</span></label></div>`;
                            return playerButton;
                        })
                        .join(" ");

                    $("#allianceCheckboxes").html(allianceCheckboxes);
                    $("#allianceProposals").removeClass("hidden");
                    break;

                default:
                    $("#allianceProposals").addClass("hidden");
            }
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

        private static printOwnAlliances() {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.PlanMoves:
                    const ownAlliances = Main.game.currentTurn.alliances.alliancePairs
                        .map(pair => {
                            return `<div><span style="color: ${pair.playerA}">${pair.playerA}</span> & <span style="color: ${pair.playerB}">${pair.playerB}</span></div>`;
                        });

                    let ownAlliancesText: string;
                    if (ownAlliances.length >= 1) {
                        ownAlliancesText = ownAlliances.join(" ");
                    } else {
                        ownAlliancesText = "You're not allied with anybody.";
                    }

                    $("#ownAlliancesList").html(ownAlliancesText);
                    $("#ownAlliances").removeClass("hidden");
                    break;

                default:
                    $("#ownAlliances").addClass("hidden");
            }
        }

        private static printPlayersPoints(showLastTurnsPoints: boolean) {
            const playersPoints = Main.game.players.map(player => {
                let points: number;
                let addedPoints: string;
                if (showLastTurnsPoints) {
                    points = player.points - player.pointsLastTurn;
                    addedPoints = "";
                } else {
                    points = player.points;
                    addedPoints = `+${player.pointsLastTurn}`;
                }

                const playerPoints = `<table style="display: inline-block"><tr><td><span class="label" style="background-color: ${player.color}; color: #fff;">${points}</span></td></tr><tr><td>${addedPoints}</td></tr></table>`;
                return playerPoints;
            });
            $("#playersPoints").html(playersPoints.join(" "));
        }

        private static printPlayersStatus() {
            const playersStatus = Main.game.players
                .map(player => {
                    return Main.getPlayerLabel(player, true);
                })
                .join(" ");
            document.getElementById("playersStatus").innerHTML = playersStatus;
        }

        private printStartPage() {
            $("#startNumberOfPlayers").val(Main.game.players.length.toString());
            $("#startPlayerColor").html(Main.getPlayerLabel(Main.currentPlayer, false));
            this.printStartPlayersReady();
        }

        private printStartPlayersReady() {
            const playersColors = Main.game.players.map(player => Main.getPlayerLabel(player, true)).join(" ");
            $("#startPlayersColors").html(playersColors);
        }

        private printTurnMode() {
            const turnMode = Main.getTurnModeString(Main.game.currentTurn.mode);
            $("#turnMode").html(turnMode);
        }

        private printTurnNumber() {
            const turnNumber = Main.game.currentTurn.turnNumber.toString();
            $("#turnNumber").html(turnNumber);
        }

        private refreshGame() {
            this.updateGameState().then(() => {
                const widthInPixels = `${CanvasSettings.width}px`;

                if (Main.game.started) {
                    if (this.canvas1 !== undefined) {
                        this.canvas1.destroy();
                        this.canvas2.destroy();
                        this.canvas3.destroy();
                        this.canvas4.destroy();
                    }

                    this.canvas1 = new Canvas(Main.game.previousTurn, this.getCanvasId(1), false);
                    this.canvas2 = new Canvas(Main.game.previousTurnWithPlaceCommands, this.getCanvasId(2), false);
                    this.canvas3 = new Canvas(Main.game.previousTurnWithMoveCommands, this.getCanvasId(3), false);
                    this.canvas4 = new Canvas(Main.game.currentTurn, this.getCanvasId(4), Main.game.currentTurn.mode === TurnMode.PlanMoves);

                    $("#playerColor").html(Main.getPlayerLabel(Main.currentPlayer, false));
                    $(".commands").css("width", widthInPixels);
                    if (Main.game.started) {
                        $("#readyButton").prop("disabled", false);

                        $("#startGameButton").prop("disabled", true);
                        $("#startGameButton").attr("title", "The game is already started.");

                        if (Main.currentPlayer.ready) {
                            $("#readyButton").addClass("active");
                        } else {
                            $("#readyButton").removeClass("active");
                        }
                    } else {
                        $("#readyButton").prop("disabled", true);

                        $("#startGameButton").prop("disabled", false);
                        $("#startGameButton").removeAttr("title");
                    }

                    Main.printNumberOfMovesLeft();
                    Main.printPlayersStatus();
                    Main.printPlayersPoints(false);
                    Main.printAllAlliances();
                    Main.printOwnAlliances();
                    Main.printAllianceCheckboxes();

                    this.setActiveBoard(4);

                    const enableFirstThreeBoards = (Main.game.currentTurn.turnNumber >= 2);
                    for (let i = 1; i <= 3; i++) {
                        const boardButtonId = `#boardButton${i}`;
                        $(boardButtonId).prop("disabled", !enableFirstThreeBoards);
                    }

                    $("#gameStarted").removeClass("hidden");
                    $("#gameStopped").addClass("hidden");
                } else {
                    $("#gameStartLobby").css("width", widthInPixels);

                    $("#gameStarted").addClass("hidden");
                    $("#gameStopped").removeClass("hidden");
                }

                this.printTurnNumber();
                this.printTurnMode();
                $("#administratorCommands").removeClass("hidden");

                this.printStartPage();

                window.setTimeout(() => this.tick(), 1000);
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

        public readyButtonClicked() {
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
            let commands: ClientCommands;
            switch (Main.game.currentTurn.mode) {
                case TurnMode.PlanMoves:
                    commands = this.getMoveCommands();
                    break;

                case TurnMode.ProposeAlliances:
                    commands = this.getAllianceProposalCommands();
                    break;

                default:
                    throw `${Main.game.currentTurn.mode} is not supported.`;
            }

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

        private getAllianceProposalCommands(): ClientCommands {
            let proposals: Array<ClientAllianceProposal> = [];

            $(".jsAllianceProposal").each((index, checkbox) => {
                if ($(checkbox).prop("checked")) {
                    const proposal = new ClientAllianceProposal($(checkbox).val());
                    proposals.push(proposal);
                }
            });

            const commands = new ClientCommands(proposals, null, null);
            return commands;
        }

        private getMoveCommands(): ClientCommands {
            const currentPlayersUnitsOnBoardOrToBePlacedOnBoard = Main.game.currentTurn.unitsOnBoardOrToBePlacedOnBoard.filter(unit => unit.player.color === Main.currentPlayer.color);

            const moveCommands = currentPlayersUnitsOnBoardOrToBePlacedOnBoard
                .filter(unit => unit.moveCommand !== null)
                .map(unit => new ClientMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex));

            const currentPlayersNewUnits = Main.game.currentTurn.newUnits.filter(unit => unit.player.color === Main.currentPlayer.color);

            const placeCommands = currentPlayersNewUnits
                .filter(unit => unit.placeCommand !== null)
                .map(unit => new ClientPlaceCommand(unit.placeCommand.on.hex));

            const commands = new ClientCommands(null, moveCommands, placeCommands);
            return commands;
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

        public toggleProposeAllianceWith() {
            Main.currentPlayer.ready = false;
        }

        public tick() {
            GameService.getStatus().then(status => {
                if (Main.game.currentTurn.turnNumber !== status.turnNumber) {
                    this.refreshGame();
                    return;
                }

                if (Main.game.started) {
                    // If the game has been started, just update the players' ready status.
                    status.players.forEach(playerData => {
                        const player = Main.game.getPlayer(playerData.color);
                        player.ready = playerData.ready;
                    });

                    Main.printPlayersStatus();
                } else {
                    let updateListOfPlayers = false;
                    if (status.players.length !== Main.game.players.length) {
                        updateListOfPlayers = true;
                    } else {
                        for (let i = 0; i < Main.game.players.length; i++) {
                            if (Main.game.players[i].color !== status.players[i].color) {
                                updateListOfPlayers = true;
                            }
                        }
                    }

                    if (updateListOfPlayers) {
                        Main.game.players = [];
                        status.players.forEach(playerData => {
                            const player = new Player(playerData);
                            Main.game.players.push(player);
                        });

                        this.printStartPage();
                    } else {
                        // Just update each players' ready status.
                        status.players.forEach(playerData => {
                            const player = Main.game.getPlayer(playerData.color);
                            player.ready = playerData.ready;
                        });
                    }

                    this.printStartPlayersReady();
                }
            });

            window.setTimeout(() => this.tick(), 1000);
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
