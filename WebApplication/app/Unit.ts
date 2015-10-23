module CocaineCartels {
    "use strict";

    export class Unit {
        constructor(
            unitData: IUnit,
            cell: Cell
        ) {
            this.unitData = unitData;
            this.cell = cell;
            this._color = tinycolor(unitData.player.color).lighten(10).toString("hex6");
        }

        private unitData: IUnit;

        private _moveCommand: MoveCommand = undefined;
        private _color: string = undefined;
        private _placeCommand: PlaceCommand = undefined;
        private _player: Player = undefined;

        /** The cell that the unit is located on. If this is null the unit is a new unit, ready to be placed on the board in this turn. */
        public cell: Cell;

        /** The color of the unit. Based on the color of the player who onws the unit. */
        public get color() {
            return this._color;
        }

        public get maximumMoveDistance(): number {
            return 1;
        }

        public get moveCommand(): MoveCommand {
            if (this._moveCommand === undefined) {
                if (this.unitData.moveCommand === null) {
                    this.moveCommand = null;
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

        public get placeCommand(): PlaceCommand {
            if (this._placeCommand === undefined) {
                if (this.unitData.placeCommand === null) {
                    this.placeCommand = null;
                } else {
                    const on = Main.game.getCell(this.unitData.placeCommand.onHex);
                    this.setPlaceCommand(on);
                }
            }

            return this._placeCommand;
        }

        public set placeCommand(newPlaceCommand: PlaceCommand) {
            if (newPlaceCommand === null) {
                this._placeCommand = null;
                return;
            }

            if (this.cell !== null) {
                throw "Cannot assign a place command to a unit that already is placed on a cell.";
            }

            this._placeCommand = newPlaceCommand;
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
            this.placeCommand = new PlaceCommand(this, on);
        }
    }
}
