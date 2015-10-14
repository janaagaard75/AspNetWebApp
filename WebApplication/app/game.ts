module Muep {
    "use strict";

    export class Game {
        constructor(demoMode: boolean) {
            this.initalizeGame();
            if (demoMode) {
                DemoSetup.addUnitsAndCommands(this);
            }
        }

        public cells: Cell[];
        public players: Player[];

        public allowedCellsForMove(unit: Unit): Cell[] {
            if (unit.cell == null) {
                return [];
            }

            const allowedCells = this.cells.filter(cell => {
                const distance = cell.distance(unit.cell);
                return (distance > 0 && distance <= unit.maximumMoveDistance);
            });

            return allowedCells;
        }

        public allowedCellsForPlace(unit: Unit): Cell[] {
            throw "allowedCellsForPlace is not yet implemented.";
        }

        public getCell(hex: Hex): Cell {
            const cell = this.cells.filter(c => { return c.hex.equals(hex); })[0];
            return cell;
        }

        public getMoveCommands(from: Cell, to: Cell): MoveCommand[] {
            const moveCommands = this.moveCommands.filter(moveCommand => moveCommand.from === from && moveCommand.to === to);
            return moveCommands;
        }

        private initalizeGame() {
            this.cells = [];
            for (let r = -Settings.gridSize; r <= Settings.gridSize; r++) {
                for (let s = -Settings.gridSize; s <= Settings.gridSize; s++) {
                    // Satisfy r+s+t=0.
                    const t = -r - s;
                    
                    // t cannot exceed gridSize.
                    if (t < -Settings.gridSize || t > Settings.gridSize) {
                        continue;
                    }

                    const hex = new Hex(r, s, t);
                    const cell = new Cell(hex);
                    this.cells.push(cell);
                }
            }

            this.players = [];
            const numberOfPlayers = 6;
            const playerColors = ["#f00", "#ff0", "#0f0", "#0ff", "#00f", "#f0f"];
            for (let i = 0; i < numberOfPlayers; i++) {
                const player = new Player(playerColors[i]);
                this.players.push(player);
            }
        }

        public get moveCommands(): MoveCommand[] {
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
            this.cells.forEach(cell => {
                var dist = cell.hex.pos.distance(pos);
                if (dist < minDist || minDist === null) {
                    minDist = dist;
                    nearestCell = cell;
                }
            });

            return nearestCell;
        }

        public get units(): Unit[] {
            const unitsDoubleArray = this.cells.map(cell => cell.units);
            const units = Utilities.flatten(unitsDoubleArray);
            return units;
        }
    }
}
