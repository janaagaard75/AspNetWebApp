module CocaineCartels {
    "use strict";

    export class MoveCommand extends Command {
        constructor(
            public unit: Unit,
            public from: Cell,
            public to: Cell
        ) {
            super(CommandType.MoveCommand, unit);

            if (unit.cell === null) {
                throw "Can only assign move commands to units that are placed on a cell.";
            }
        }

        private _color: string = undefined;

        public get color() {
            if (this._color === undefined) {
                this._color = this.unit.player.color;
            }

            return this._color;
        }
    }
}
