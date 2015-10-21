module Muep {
    "use strict";

    export class Unit {
        constructor(
            unitData: IUnit,
            cell: Cell
        ) {
            this.unitData = unitData;
            this.cell = cell;

            // TODO: Transfer the data from unitData.
            this.placeCommand = null;

            this._color = tinycolor(unitData.player.color).lighten(10).toString("hex6");
        }

        private unitData: IUnit;

        private _moveCommand: MoveCommand = undefined;
        private _color: string = undefined;
        private _player: Player = undefined;

        public placeCommand: PlaceCommand;

        public cell: Cell;

        public get color() {
            return this._color;
        }

        public get commandColor() {
            return this.player.color;
        }

        public get maximumMoveDistance(): number {
            return 1;
        }

        public get moveCommand(): MoveCommand {
            if (this._moveCommand === undefined) {
                if (this.unitData.moveCommand === null) {
                    this._moveCommand = null;
                } else {
                    const from = Main.game.getCell(this.unitData.moveCommand.fromHex);
                    this.setMoveCommand(from);
                }
            }

            return this._moveCommand;
        }

        public set moveCommand(newMoveCommand: MoveCommand) {
            if (newMoveCommand === null) {
                this._moveCommand = null;
                return;
            }

            if (this.cell === null && this.placeCommand === null) {
                throw "Cannot assign a move command to a unit that isn't positioned on a cell or doesn't have a place command.";
            }

            this._moveCommand = newMoveCommand;
        }

        public get player(): Player {
            if (this._player === undefined) {
                this._player = Main.game.getPlayer(this.unitData.player);
            }

            return this._player;
        }

        public setMoveCommand(from: Cell) {
            this.moveCommand = new MoveCommand(this, from);
        }

        public setPlaceCommand(on: Cell) {
            if (this.cell !== null) {
                throw "Cannot assign a place command ot a unit that already is placed on a cell.";
            }

            this.placeCommand = new PlaceCommand(this, on);
        }
    }
}
