module Muep {
    "use strict";

    export class Unit {
        constructor(
            unitData: IUnit,
            gameInstance: Game
        ) {
            this.cell = null;

            // TODO: Transfer the data from unitData.
            this.placeCommand = null;

            if (unitData.moveCommand !== null) {
                const moveToCell = gameInstance.getCell(unitData.moveCommand.toHex);
                this.setMoveCommand(moveToCell);
            }

            this.moveCommand = null;

            this.player = gameInstance.getPlayer(unitData.player);

            // TODO: Should get the data from the player.
            this._color = tinycolor(unitData.player.color).lighten(10).toString("hex6");
        }

        private _color: string;
        public moveCommand: MoveCommand;
        public placeCommand: PlaceCommand;
        public player: Player;

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

        public setMoveCommand(to: Cell): MoveCommand {
            if (this.cell === null && this.placeCommand === null) {
                throw "Cannot assign a move command to a unit that isn't positioned on a cell or doesn't have a place command.";
            }

            this.moveCommand = new MoveCommand(this, to);
            return this.moveCommand;
        }

        public setPlaceCommand(on: Cell): PlaceCommand {
            if (this.cell !== null) {
                throw "Cannot assign a place command ot a unit that already is placed on a cell.";
            }

            this.placeCommand = new PlaceCommand(this, on);
            return this.placeCommand;
        }
    }
}
