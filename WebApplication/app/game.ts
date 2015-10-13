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
            this.getCell(new Hex(3, -3, 0)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(0, -3, 3)).addUnit(new Unit(greenPlayer));
            this.getCell(new Hex(-3, 0, 3)).addUnit(new Unit(cyanPlayer));
            this.getCell(new Hex(-3, 3, 0)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 3, -3)).addUnit(new Unit(magentaPlayer));

            this.getCell(new Hex(0, 0, 0)).addUnit(new Unit(redPlayer));
            this.getCell(new Hex(0, 0, 0)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(0, 0, 0)).addUnit(new Unit(greenPlayer));

            this.getCell(new Hex(0, -1, 1)).addUnit(new Unit(greenPlayer));
            this.getCell(new Hex(0, -1, 1)).addUnit(new Unit(greenPlayer));

            this.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));
            this.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));
            this.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));

            this.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));

            this.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));

            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(redPlayer));
            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(yellowPlayer));
            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(greenPlayer));
            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(cyanPlayer));
            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(bluePlayer));
            this.getCell(new Hex(1, 0, -1)).addUnit(new Unit(magentaPlayer));

            for (let i = 0; i < 6; i++) {
                var r = 0;
                var s = 0;
                var t = 0;
                switch (i) {
                    case 0:
                        r = 1;
                        s = -1;
                        break;
                    case 1:
                        r = 1;
                        t = -1;
                        break;
                    case 2:
                        s = 1;
                        t = -1;
                        break;
                    case 3:
                        r = -1;
                        s = 1;
                        break;
                    case 4:
                        r = -1;
                        t = 1;
                        break;
                    case 5:
                        s = -1;
                        t = 1;
                        break;
                }

                const cyanUnit = new Unit(cyanPlayer);
                this.getCell(new Hex(2, -2, 0)).addUnit(cyanUnit);
                cyanUnit.setMoveCommand(this.getCell(new Hex(2 + r, -2 + s, 0 + t)), this.getCell(new Hex(2, -2, 0)));
            }

            for (let i = 0; i < 4; i++) {
                var from: Hex;
                if (i < 2) {
                    from = new Hex(0, 2, -2);
                } else {
                    from = new Hex(1, 2, -3);
                }

                const magentaUnit = new Unit(magentaPlayer);
                this.getCell(new Hex(1, 1, -2)).addUnit(magentaUnit);
                magentaUnit.setMoveCommand(this.getCell(from), this.getCell(new Hex(1, 1, -2)));
            }

            for (let i = 0; i < 6; i++) {
                const greenUnit = new Unit(greenPlayer);
                this.getCell(new Hex(-1, -2, 3)).addUnit(greenUnit);
                greenUnit.setMoveCommand(this.getCell(new Hex(0, -3, 3)), this.getCell(new Hex(-1, -2, 3)));
            }
        }

        /** Moves a unit to the specified cell. Also sets the command to null. */
        public moveUnit(unit: Unit, newCell: Cell) {
            unit.cell.removeUnit(unit);
            newCell.addUnit(unit);
            unit.command = null;
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
