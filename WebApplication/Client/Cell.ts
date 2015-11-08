module CocaineCartels {
    "use strict";

    export class Cell {
        constructor(
            cellData: ICell,
            board: Board
        ) {
            this._cellData = cellData;
            this.board = board;
            this.hex = new Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
        }

        private _cellData: ICell;
        private _units: Array<Unit> = undefined;

        public board: Board;
        public dropAllowed = false;
        public hex: Hex;
        public hexagon: Konva.Shape;
        public hovered = false;

        public get moveCommandsFromCell(): Array<MoveCommand> {
            const moveCommands = this.units
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        public get moveCommandsToCell(): Array<MoveCommand> {
            const commands = Main.game.currentTurn.moveCommands.filter(moveCommand => moveCommand.to === this);
            return commands;
        }

        /** Units on this cell, not taking into account that some of them might have move commands to other cells. Units placed on this cell are included. */
        public get units(): Array<Unit> {
            if (this._units === undefined) {
                this._units = [];
                this._cellData.units.forEach(unitData => {
                    const unit = new Unit(unitData, this);
                    this.addUnit(unit);
                });
            }

            return this._units;
        }

        public get unitsMovingHere(): Array<Unit> {
            const unitsMovingHere = this.moveCommandsToCell.map(command => command.unit);
            return unitsMovingHere;
        }

        public get unitsPlacedHere(): Array<Unit> {
            const unitsPlacedHere = this.units.filter(unit => unit.placeCommand !== null);
            return unitsPlacedHere;
        }

        public get unitsStaying(): Array<Unit> {
            const unitsStaying = this.units.filter(unit => unit.moveCommand === null);
            return unitsStaying;
        }

        public addUnit(unit: Unit) {
            if (unit.cell !== null && unit.cell !== this) {
                throw "The unit is already placed on another cell.";
            }

            if (this.units.filter(u => u === unit).length > 0) {
                throw "The unit is already on the cell.";
            }

            this.units.push(unit);
            unit.cell = this;
        }

        /** Returns the Manhatten distance between this cell and another cell. See http://www.redblobgames.com/grids/hexagons/#distances */
        public distance(other: Cell): number {
            const distance = Math.max(
                Math.abs(this.hex.r - other.hex.r),
                Math.abs(this.hex.s - other.hex.s),
                Math.abs(this.hex.t - other.hex.t));

            return distance;
        }

        public removeUnit(unit: Unit) {
            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                u.cell = null;
            });

            this._units = this.units.filter(u => u !== unit);
        }
    }
}
