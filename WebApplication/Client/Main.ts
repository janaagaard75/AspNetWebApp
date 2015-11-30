module CocaineCartels {
    "use strict";

    export class Main {
        constructor() {
            CanvasSettings.initialize(Settings.gridSize);
            this.refreshGame();
        }

        private interactiveCanvas: Canvas; // The canvas is actually static when in 'propose alliances' turn mode.
        private replayCanvas: Canvas;

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

        private static getPlayerBadge(player: Player, emptyIfNotReady: boolean): string {
            const label = Main.getPlayerLabel(player, "&nbsp;&nbsp;&nbsp;", !emptyIfNotReady || player.ready);
            return label;
        }

        private static getPlayerLabel(player: Player, content: string, filledBackground: boolean) {
            if (filledBackground) {
                const label = `<span class="label label-border" style="border-color: ${player.color}; background-color: ${player.color};">${content}</span>`;
                return label;
            } else {
                const label = `<span class="label label-border" style="border-color: ${player.color};">${content}</span>`;
                return label;
            }
        }

        private static getTurnModeStrings(turnMode: TurnMode, dragMode: DragMode): TurnModeStrings {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.PlanMoves:
                    switch (dragMode) {
                        case DragMode.NewUnits:
                            return new TurnModeStrings(
                                "Place new units",
                                `Reinforce you positions by dragging your new units to the territories that you already control. All players get ${Settings.newUnitsPerTurn} new units per turn plus a unit for each ${Settings.newUnitPerCellsControlled} cell controlled.`);

                        case DragMode.UnitsOnBoard:
                            return new TurnModeStrings(
                                "Move units",
                                `Drag units to conquer new territories or reinforce your positions. You get one point per turn for each territory you control. You can move up to ${Settings.movesPerTurn} units per turn.`);

                        default:
                            throw `The DragMode ${dragMode} is not supported.`;
                    }
 
                case TurnMode.ProposeAlliances:
                    return new TurnModeStrings(
                        "Propose alliances",
                        "Check the players that you would like to propose alliances to. If any of your alliance propositions are returned, an alliance is formed for the next turn."
                    );

                case TurnMode.StartGame:
                    return new TurnModeStrings(
                        "Waiting for players to join",
                        "Waiting for players to join the game. Once you can see that the number of players is correct, press the Ready button. The game will start when all players have pressed the button.");

                default:
                case TurnMode.Undefined:
                    return new TurnModeStrings(
                        "Unknown",
                        "Unknown");
            }
        }

        private static printAllAlliances() {
            switch (Main.game.currentTurn.mode) {
                case TurnMode.ProposeAlliances:
                    const allAlliances = Main.game.currentTurn.alliances.alliancePairs
                        .map(pair => {
                            return `<div><span style="color: ${pair.playerA.color}">${pair.playerA.name}</span> & <span style="color: ${pair.playerB.color}">${pair.playerB.name}</span></div>`;
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
                    const allianceProposals = Main.game.currentTurn.allianceProposals.map(proposal => proposal.toPlayer.color);
                    const enemies = Main.game.players.filter(p => p !== Main.currentPlayer);
                    const allianceCheckboxes = enemies
                        .map(enemy => {
                            const isChecked = (allianceProposals.indexOf(enemy.color) !== -1);
                            const checked = isChecked ? ` checked=""` : "";
                            const playerButton = `<div class="checkbox"><label><input type="checkbox" value="${enemy.color}" ${checked} onclick="cocaineCartels.toggleProposeAllianceWith();" class="jsAllianceProposal" /> <span style="color: ${enemy.color}">${enemy.name}</span></label></div>`;
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
                            const html = [
                                "<div>",
                                ` <span style="color: ${pair.playerA.color}">${pair.playerA.name}</span>`,
                                " & ",
                                ` <span style="color: ${pair.playerB.color}">${pair.playerB.name}</span>`,
                                "</div>"
                            ].join("");

                            return html;
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
            const playerPointsRows = Main.game.players
                // Sort decending.
                .sort((playerA, playerB) => playerB.points - playerA.points)
                .map(player => {
                    let points: number;
                    let addedPoints: string;
                    if (showLastTurnsPoints) {
                        points = player.points - player.pointsLastTurn;
                        addedPoints = "";
                    } else {
                        points = player.points;
                        addedPoints = `+${player.pointsLastTurn}`;
                    }

                    const playerPoints = [
                        "<p>",
                        Main.getPlayerLabel(player, points.toString(), true),
                        `  ${addedPoints}`,
                        "</p>"
                    ].join("");

                    return playerPoints;
                });

            const playersPoints = [
                "<table>",
                playerPointsRows.join(""),
                "</table>"
            ].join("");

            $("#playersPoints").html(playersPoints);
        }

        private static printPlayersStatus() {
            const playersStatus = Main.game.players
                .map(player => {
                    return Main.getPlayerBadge(player, true);
                })
                .join(" ");
            document.getElementById("playersStatus").innerHTML = playersStatus;
        }

        private printStartPage() {
            $("#startNumberOfPlayers").html(Main.game.players.length.toString());
            $("#playerColor").html(Main.getPlayerBadge(Main.currentPlayer, false));
            this.printStartPlayersReady();
        }

        private printStartPlayersReady() {
            const playersColors = Main.game.players.map(player => Main.getPlayerBadge(player, true)).join(" ");
            $("#startPlayersColors").html(playersColors);
        }

        /** Static because it's called by Canvas.redrawBoard(). Not the most beautiful code architecture. */
        public static printTurnMode(dragMode: DragMode) {
            const turnModeStrings = Main.getTurnModeStrings(Main.game.currentTurn.mode, dragMode);
            $("#turnModeHeader").html(turnModeStrings.header);
            $("#turnModeDescription").html(turnModeStrings.description);
        }

        private printTurnNumber() {
            const turnNumber = Main.game.currentTurn.turnNumber.toString();
            $("#turnNumber").html(turnNumber);
        }

        private refreshGame() {
            this.updateGameState().then(() => {
                const widthInPixels = `${CanvasSettings.width}px`;

                if (Main.game.started) {
                    if (this.interactiveCanvas !== undefined) {
                        this.interactiveCanvas.destroy();
                        this.replayCanvas.destroy();
                    }

                    this.interactiveCanvas = new Canvas(Main.game.currentTurn, "interactiveCanvas", false, Main.game.currentTurn.mode === TurnMode.PlanMoves);
                    this.replayCanvas = new Canvas(Main.game.previousTurn, "replayCanvas", true, false);

                    $("#playerColor").html(Main.getPlayerBadge(Main.currentPlayer, false));
                    $(".commands").css("width", widthInPixels);
                    if (Main.game.started) {
                        const hideReplayButton = (Main.game.previousTurn === null);
                        $("#replayButtonWrapper").toggleClass("hidden", hideReplayButton);

                        $("#readyButton").prop("disabled", false);

                        $("#startGameButton").prop("disabled", true);
                        $("#startGameButton").attr("title", "The game is already started.");

                        $("#readyButton").toggleClass("active", Main.currentPlayer.ready);
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

                    this.setActiveCanvas("interactiveCanvas");

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
                Main.printTurnMode(DragMode.NewUnits);
                $("#administratorCommands").removeClass("hidden");

                this.printStartPage();

                window.setTimeout(() => this.tick(), 1000);
            });
        }

        private reloadPage() {
            window.location.reload();
        }

        public replayLastTurn() {
            $("#replayButton").prop("disabled", true);

            this.setActiveCanvas("replayCanvas");

            this.replayCanvas.replayLastTurn().then(() => {
                this.setActiveCanvas("interactiveCanvas");
                $("#replayButton").prop("disabled", false);
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

        private resetGame() {
            GameService.resetGame().then(() => {
                this.reloadPage();
            });
        }

        public resetMoves() {
            this.interactiveCanvas.resetMoves();
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

        private setActiveCanvas(canvasId) {
            const canvasIds = ["interactiveCanvas", "replayCanvas"];
            canvasIds.forEach(id => {
                const canvasElement = $(`#${id}`);
                if (id === canvasId) {
                    canvasElement.removeClass("hidden");
                } else {
                    canvasElement.addClass("hidden");
                }
            });
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
            Main.setCurrentPlayerNotReady();
        }

        public tick() {
            GameService.getStatus()
                .then(status => {
                    if (Main.currentPlayer.color !== status.currentPlayer.color) {
                        this.refreshGame();
                        return;
                    }

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

                            this.printStartPlayersReady();
                        }
                    }

                    window.setTimeout(() => this.tick(), 1000);
                })
                .catch(e => {
                    alert("Oh noes! An internal error occurred. (╯°□°)╯︵ ┻━┻\n\n(Refresh the browser window and hope for the best.)");
                    console.error(e);
                });
        }

        private updateGameState(): Promise<void> {
            return GameService.getGameState().then(gameState => {
                Main.game = gameState.gameInstance;
                Main.game.initializeBoard(Main.game.previousTurn);
                Main.game.initializeBoard(Main.game.currentTurn);
                Main.currentPlayer = gameState.currentPlayer;
            });
        }
    }

    class TurnModeStrings {
        constructor(
            public header: string,
            public description: string
        ) { }
    }
}
