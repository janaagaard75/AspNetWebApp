module Muep {
    "use strict";

    export class Unit {
        constructor(
            public player: Player
        ) {
            this.cell = null;
            this.command = null;
        }

        public cell: Cell;
        public command: Command;

        public get color() {
            const unitColor = tinycolor(this.player.color).lighten(0);
            return unitColor.toString("hex6");
        }

        public get commandColor() {
            return this.player.color;
        }

        public setMoveCommand(from: Cell, to: Cell): MoveCommand {
            const moveCommand = new MoveCommand(this, from, to);
            this.command = moveCommand;
            return moveCommand;
        }
    }
}
