module Muep {
    "use strict";

    export class Game {
        constructor() {
            this.initalizeGame();
        }

        private gridSize = 3;
        private playerColors = ["#f00", "#0f0", "#00f"];

        public cells: Cell[];
        public players: Player[];

        initalizeGame() {
            this.cells = [];
            for (let r = -this.gridSize; r <= this.gridSize; r++) {
                for (let s = -this.gridSize; s <= this.gridSize; s++) {
                    // Satisfy r+s+t=0.
                    const t = -r - s;
                    
                    // t cannot exceed gridSize.
                    if (t < -this.gridSize || t > this.gridSize) {
                        continue;
                    }

                    const hex = new Hex(r, s, t);
                    const cell = new Cell(hex);
                    this.cells.push(cell);
                }
            }

            const redPlayer = new Player("#f00");
            const yellowPlayer = new Player("#ff0")
            const greenPlayer = new Player("#0f0");
            const cyanPlayer = new Player("#0ff");
            const bluePlayer = new Player("#00f");
            const magentaPlayer = new Player("#f0f");

            this.players = [redPlayer, yellowPlayer, greenPlayer, cyanPlayer, bluePlayer];

            this.getCell(new Hex(3, 0, -3)).addUnit(new Unit(redPlayer));
            var yellowUnit = new Unit(yellowPlayer)
            this.getCell(new Hex(2, -2, 0)).addUnit(yellowUnit);
            yellowUnit.setMoveCommand(this.getCell(new Hex(3, -3, 0)), this.getCell(new Hex(2, -2, 0)));
            this.getCell(new Hex(0, -3, 3)).addUnit(new Unit(greenPlayer));
            this.getCell(new Hex(-3, 0, 3)).addUnit(new Unit(cyanPlayer));
            this.getCell(new Hex(-3, 3, 0)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 3, -3)).addUnit(new Unit(magentaPlayer));
        }

        public get commands(): Command[] {
            const commands = this.units.map(unit => unit.command).filter(command => command !== null);
            return commands;
        }

        private static flatten<T>(doubleArray: T[][]): T[] {
            const flattened = Array.prototype.concat.apply([], doubleArray);
            return flattened;
        }

        private getCell(hex: Hex): Cell {
            const cell = this.cells.filter(c => { return c.hex.equals(hex); })[0];
            return cell;
        }

        /** Moves a unit to the specified cell. Also sets the command to null. */
        public moveUnit(unit: Unit, newCell: Cell) {
            unit.cell.removeUnit(unit);
            newCell.addUnit(unit);
            unit.command = null;
        }

        /** Returns the nearest cell not futher away than maximumDistance. */
        public nearestAllowedCell(pos: Konva.Vector2d, origin: Cell, maximumDistance: number): Cell {
            const allowedCells = this.cells.filter(cell => cell.distance(origin) <= maximumDistance);
            const nearestCell = Game.nearestCell(pos, allowedCells);
            return nearestCell;
        }

        public nearestCell(pos: Konva.Vector2d): Cell {
            const nearestCell = Game.nearestCell(pos, this.cells);
            return nearestCell;
        }

        private static nearestCell(pos: Konva.Vector2d, cells: Cell[]): Cell {
            var minDist: number = null;
            var nearestCell: Cell;
            cells.forEach(cell => {
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
            const units = Game.flatten(unitsDoubleArray);
            return units;
        }
    }
}
