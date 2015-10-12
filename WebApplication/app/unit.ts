module Muep {
    "use strict";

    export class Unit {
        constructor(
            public player: Player
        ) {
            this.cell = null;
            this.command = null;

            this._color = tinycolor(this.player.color).lighten(0).toString("hex6");
        }

        private _color: string;
        public cell: Cell;
        public command: Command;

        public get color() {
            return this._color;
        }

        public get commandColor() {
            return this.player.color;
        }

        public get maximumMoveDistance(): number {
            return 1;
        }

        public setMoveCommand(from: Cell, to: Cell): MoveCommand {
            const moveCommand = new MoveCommand(this, from, to);
            this.command = moveCommand;
            return moveCommand;
        }
    }
}
