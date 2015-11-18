module CocaineCartels {
    "use strict";

    export class Game {
        constructor(currentTurnData: IBoard, gameData: IGame) {
            this.players = [];
            gameData.players.forEach(playerData => {
                const player = new Player(playerData);
                this.players.push(player);
            });

            if (gameData.previousTurn === null) {
                this.previousTurn = null;
            } else {
                this.previousTurn = new Board(gameData.previousTurn);
            }

            if (gameData.previousTurnShowingPlaceCommands === null) {
                this.previousTurnWithPlaceCommands = null;
            } else {
                this.previousTurnWithPlaceCommands = new Board(gameData.previousTurnShowingPlaceCommands);
            }

            if (gameData.previousTurnShowingMoveCommands === null) {
                this.previousTurnWithMoveCommands = null;
            } else {
                this.previousTurnWithMoveCommands = new Board(gameData.previousTurnShowingMoveCommands);
            }

            this.currentTurn = new Board(currentTurnData);

            this.started = gameData.started;
            this.turnMode = gameData.turnMode;
            this.turnNumber = gameData.turnNumber;
        }

        public currentTurn: Board;
        public players: Array<Player>;
        public previousTurn: Board;
        public previousTurnWithPlaceCommands: Board;
        public previousTurnWithMoveCommands: Board;
        public started: boolean;
        public turnMode: TurnMode;
        public turnNumber: number;

        /** Returns the player with the specified color. Returns null if the player wasn't found. */
        public getPlayer(playerColor: string): Player {
            const players = this.players.filter(p => p.color === playerColor);

            if (players.length === 0) {
                return null;
            }

            return players[0];
        }

        /** Hacky solution for initializing the boards. */
        public initializeBoard(board: Board) {
            if (board === null) {
                return;
            }

            // Initialize the units on the board.
            // ReSharper disable once QualifiedExpressionMaybeNull
            board.cells.forEach(cell => {
                cell.units.forEach(unit => {
                    // ReSharper disable once WrongExpressionStatement
                    unit.player;
                });
            });

            board.newUnits.forEach(unit => {
                // ReSharper disable once WrongExpressionStatement
                unit.player;
            });
        }
    }
}
