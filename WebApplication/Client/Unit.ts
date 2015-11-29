module CocaineCartels {
    "use strict";

    export class Unit {
        /** Set cell to null if this is a new unit. */
        constructor(
            unitData: IUnit,
            board: Turn,
            cell: Cell
        ) {
            this._unitData = unitData;
            this.board = board;
            this.cell = cell;
            this.circle = null;
            this.killed = unitData.killed;
            this.newUnit = unitData.newUnit;

            this._color = unitData.player.color;
            this._movedColor = tinycolor(unitData.player.color).lighten(35).toString("hex6");
        }

        private _color: string;
        private _placeCommand: PlaceCommand = undefined;
        private _player: Player = undefined;
        private _moveCommand: MoveCommand = undefined;
        private _movedColor: string;
        private _unitData: IUnit;

        /** The board that this units is located on. Never null. */
        public board: Turn;
        /** The cell that the unit is located on. Null if this is a new unit that has not yet been placed on the board. */
        public cell: Cell;
        public circle: Konva.Circle;
        public killed: boolean;
        public newUnit: boolean;

        public get cellAfterPlaceBeforeMove(): Cell {
            if (this.moveCommand !== null) {
                return this.moveCommand.from;
            }

            if (this.placeCommand !== null) {
                return this.placeCommand.on;
            }

            return this.cell;
        }

        public get cellAfterPlaceAndMove(): Cell {
            if (this.moveCommand !== null) {
                return this.moveCommand.to;
            }

            if (this.placeCommand !== null) {
                return this.placeCommand.on;
            }

            return this.cell;
        }

        /** The color of the unit. Based on the color of the player who onws the unit. */
        public get color() {
            return this._color;
        }

        public get maximumMoveDistance(): number {
            return 1;
        }

        public get moveCommand(): MoveCommand {
            if (this._moveCommand === undefined) {
                if (this._unitData.moveCommand === null) {
                    this.moveCommand = null;
                } else {
                    const from = this.board.getCell(this._unitData.moveCommand.fromHex);
                    const to = this.board.getCell(this._unitData.moveCommand.toHex);
                    this.setMoveCommand(from, to);
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
                throw "Can only assign a move command to a unit that is positioned on a cell or has a place command.";
            }

            this._moveCommand = newMoveCommand;
        }

        public get movedColor(): string {
            return this._movedColor;
        }

        public get placeCommand(): PlaceCommand {
            if (this._placeCommand === undefined) {
                if (this._unitData.placeCommand === null) {
                    this.placeCommand = null;
                } else {
                    const on = this.board.getCell(this._unitData.placeCommand.onHex);
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

            // This has been removed for now to allow new units to be highlighted on the second board.
            //if (this.cell !== null) {
            //    throw "Cannot assign a place command to a unit that already is placed on a cell.";
            //}

            this._placeCommand = newPlaceCommand;
        }

        public get player(): Player {
            if (this._player === undefined) {
                this._player = Main.game.getPlayer(this._unitData.player.color);
            }

            return this._player;
        }

        public deleteUnit() {
            this.cell = null;
            this._moveCommand = null;
            this._placeCommand = null;
            this._player = null;
        }

        public setMoveCommand(from: Cell, to: Cell) {
            if (from === to) {
                this.moveCommand = null;
            } else {
                this.moveCommand = new MoveCommand(this, from, to);
            }
        }

        public setPlaceCommand(on: Cell) {
            this.placeCommand = new PlaceCommand(this, on);
        }
    }
}
