module CocaineCartels {
    "use strict";

    export class Game {
        constructor(gameData: IGame) {
            this.players = [];
            gameData.players.forEach(playerData => {
                const player = new Player(playerData);

                const newUnitsForThisPlayer = gameData.newUnits.filter(u => u.player.color === player.color);
                newUnitsForThisPlayer.forEach(unitData => {
                    player.addNewUnit(unitData);
                });

                this.players.push(player);
            });

            this.board = new Board(gameData.board);

            this.started = gameData.started;
        }

        public board: Board;
        public players: Array<Player>;
        public started: boolean;

        public get moveCommands(): Array<MoveCommand> {
            const moveCommands = this.unitsOnBoard
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        /** Returns the number of move commands that the current player has assigned. */
        public get numberOfMoveCommands(): number {
            const numberOfMoveCommands = this.moveCommands.filter(command => command.unit.player.color === Main.playerColor).length;
            return numberOfMoveCommands;
        }

        public get unitsOnBoard(): Array<Unit> {
            const unitsDoubleArray = this.board.cells.map(cell => cell.units);
            const units = Utilities.flatten(unitsDoubleArray);
            return units;
        }

        public allowedCellsForMove(unit: Unit): Array<Cell> {
            if (unit.cell == null) {
                throw "It's not allowed to move a cell that is not already on the board.";
            }

            const allowedCells = this.board.cells.filter(cell => {
                const allowed = cell.distance(unit.cell) <= unit.maximumMoveDistance;
                return allowed;
            });

            return allowedCells;
        }

        public allowedCellsForPlace(unit: Unit): Array<Cell> {
            const cellsWithUnits = this.board.cells.filter(cell => {
                const cellHasUnitsBelongingToCurrentPlayer = cell.units
                    .filter(u => u.moveCommand === null)
                    .filter(u => u.player === unit.player)
                    .length > 0;

                return cellHasUnitsBelongingToCurrentPlayer;
            });

            const moveFromCells = this.moveCommands
                .filter(mc => mc.unit.player === unit.player)
                .map(mc => mc.from);

            const allowedCells = Utilities.union(cellsWithUnits, moveFromCells);
            return allowedCells;
        }

        public getCell(hex: IHex): Cell {
            const cell = this.board.cells.filter(c => { return c.hex.equals(hex); })[0];
            return cell;
        }

        public getMoveCommands(from: Cell, to: Cell): Array<MoveCommand> {
            const moveCommands = this.moveCommands.filter(moveCommand => moveCommand.from === from && moveCommand.to === to);
            return moveCommands;
        }

        public getPlayer(playerData: IPlayer): Player {
            const players = this.players.filter(p => p.color === playerData.color);

            if (players.length === 0) {
                throw `Player with color ${playerData.color} not found.`;
            }

            return players[0];
        }

        /** Hacky solution for initializing the new units. */
        public initializeGame() {
            // Initialize the units on the board.
            this.board.cells.forEach(cell => {
                cell.units.forEach(unit => {
                    // ReSharper disable once WrongExpressionStatement
                    unit.player;
                });
            });

            // Initialize the new units.
            this.players.forEach(player => {
                player.units.forEach(unit => {
                    // ReSharper disable once WrongExpressionStatement
                    unit.player;
                });
            });
        }

        public nearestCell(pos: Konva.Vector2d): Cell {
            var minDist: number = null;
            var nearestCell: Cell;
            this.board.cells.forEach(cell => {
                var dist = cell.hex.pos.distance(pos);
                if (dist < minDist || minDist === null) {
                    minDist = dist;
                    nearestCell = cell;
                }
            });

            return nearestCell;
        }

        public placeUnit(unit: Unit, on: Cell) {
            if (unit.cell !== null) {
                throw "The unit is already placed on a cell.";
            }

            on.addUnit(unit);
        }
    }
}
