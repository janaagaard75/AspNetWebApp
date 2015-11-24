module CocaineCartels {
    "use strict";

    export class Cell {
        constructor(
            cellData: ICell,
            board: Turn
        ) {
            this._cellData = cellData;
            this.board = board;
            this.hex = new Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
        }

        private _cellData: ICell;
        private _units: Array<Unit> = undefined;

        public board: Turn;
        public dropAllowed = false;
        public hex: Hex;
        public hexagon: Konva.Shape;
        public hovered = false;

        public get moveCommandsFromCell(): Array<MoveCommand> {
            const moveCommands = this.unitsAlreadyHereOrToBePlacedHere
                .map(unit => unit.moveCommand)
                .filter(moveCommand => moveCommand !== null);

            return moveCommands;
        }

        public get moveCommandsToCell(): Array<MoveCommand> {
            const commands = Main.game.currentTurn.moveCommands.filter(moveCommand => moveCommand.to === this);
            return commands;
        }

        /** Units on this cell, not taking into account that some of them might have move commands to other cells. Units to be placed on this cell are not included. */
        public get units(): Array<Unit> {
            if (this._units === undefined) {
                this._units = [];
                this._cellData.units.forEach(unitData => {
                    const unit = new Unit(unitData, this.board, this);
                    this.addUnit(unit);
                });
            }

            return this._units;
        }

        /** Returns the units that were already here or to be placed on this cell. Units might be moved to another cell. */
        public get unitsAlreadyHereOrToBePlacedHere(): Array<Unit> {
            const unitsAlreadyHereOrToBePlacedHere = this.units.concat(this.unitsToBePlacedHere);
            return unitsAlreadyHereOrToBePlacedHere;
        }

        /** Units on this cell that were move here. This type of units is only shown on the third board. */
        //public get unitsMovedHere(): Array<Unit> {
        //    const unitsMovedHere = this.units.filter(unit => unit.moveCommand !== null && unit.moveCommand.to === this);
        //    return unitsMovedHere;
        //}

        /** Units that have a move commands to this cell. Units might be new units that also have a place command. */
        public get unitsToBeMovedHere(): Array<Unit> {
            const unitsMovingHere = this.moveCommandsToCell.map(command => command.unit);
            return unitsMovingHere;
        }

        /** Units already on the cell and not moved away. Does not include units that will be placed here. */
        public get unitsStaying(): Array<Unit> {
            const unitsStaying = this.units.filter(unit => unit.moveCommand === null);
            return unitsStaying;
        }

        /** Returns the units to be placed on this cell. Units might be moved to another cell. */
        public get unitsToBePlacedHere(): Array<Unit> {
            const unitsToBeplacedHere = this.board.newUnits.filter(unit => {
                return unit.placeCommand !== null && unit.placeCommand.on === this;
            });
            return unitsToBeplacedHere;
        }

        public get unitsToBePlacedHereAndNotMovedAway(): Array<Unit> {
            const unitsToBePlacedHereAndNotMovedAway = this.unitsToBePlacedHere.filter(unit => unit.moveCommand === null);
            return unitsToBePlacedHereAndNotMovedAway;
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
