module Muep {
    "use strict";

    export class Unit {
        constructor(
            public player: Player
        ) {
            this.cell = null;
            this.command = null;

            this._color = tinycolor(this.player.color).lighten(10).toString("hex6");
        }

        private _color: string;
        public cell: Cell;
        public command: Command; // TODO: A unit may have both a place command and a move command.

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
            if (this.cell === null) {
                throw "Cannot assign a move command to a unit that isn't positioned on a cell.";
            }

            const moveCommand = new MoveCommand(this, to);
            this.command = moveCommand;
            return moveCommand;
        }
    }
}
