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
            const greenPlayer = new Player("#0f0");
            const bluePlayer = new Player("#00f");

            this.players = [redPlayer, greenPlayer, bluePlayer];

            const redUnit = new Unit(redPlayer);
            const centerCell = this.getCell(new Hex(0, 0, 0));
            const rightFromCenter = this.getCell(new Hex(1, -1, 0));
            centerCell.addUnit(redUnit);
            redUnit.command = new MoveCommand(redUnit, rightFromCenter, centerCell);

            const blueUnit = new Unit(bluePlayer);
            const topLeftFromCenter = this.getCell(new Hex(0, 1, -1));
            const otherCell = this.getCell(new Hex(0, 2, -2));
            topLeftFromCenter.addUnit(blueUnit);
            blueUnit.command = new MoveCommand(blueUnit, otherCell, topLeftFromCenter);
        }

        public get commands(): Command[] {
            const commands = this.units.map(unit => unit.command);
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

        public moveUnit(unit: Unit, newCell: Cell) {
            unit.cell.removeUnit(unit);
            newCell.addUnit(unit);
            unit.command = null;
        }

        public nearestCell(pos: IPos): Cell {
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
            const units = Game.flatten(unitsDoubleArray);
            return units;
        }
    }
}
