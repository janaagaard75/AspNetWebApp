module CocaineCartels {
    "use strict";

    export class Game {
        constructor(gameData: IGame) {
            this.players = [];
            gameData.players.forEach(playerData => {
                const player = new Player(playerData);
                this.players.push(player);
            });

            this.board = new Board(gameData.board);
        }

        public board: Board;
        public players: Array<Player>;

        public allowedCellsForMove(unit: Unit): Array<Cell> {
            if (unit.cell == null) {
                return [];
            }

            const allowedCells = this.board.cells.filter(cell => {
                const distance = cell.distance(unit.cell);
                return (distance > 0 && distance <= unit.maximumMoveDistance);
            });

            return allowedCells;
        }

        public allowedCellsForPlace(unit: Unit): Array<Cell> {
            throw "allowedCellsForPlace is not yet implemented.";
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

        public get moveCommands(): Array<MoveCommand> {
            const moveCommands = this.units
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        /** Moves a unit to the specified cell. Also sets the move command to null. */
        public moveUnit(unit: Unit, to: Cell) {
            if (unit.placeCommand !== null) {
                throw "Cannot move a unit the has a place command assigned to it.";
            }

            unit.moveCommand = null;
            unit.cell.removeUnit(unit);
            to.addUnit(unit);
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

        public get units(): Array<Unit> {
            const unitsDoubleArray = this.board.cells.map(cell => cell.units);
            const units = Utilities.flatten(unitsDoubleArray);
            return units;
        }
    }
}
