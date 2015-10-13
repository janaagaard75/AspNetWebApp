module Muep {
    "use strict";

    export class Cell {
        constructor(
            public hex: Hex
        ) {
            this.units = [];
        }

        // Should either merge hovered and dropAllowed into an enum or make the hovering highlight elsewhere, so that both are possible.
        public dropAllowed = false;
        public hexagon: Konva.Shape;
        public hovered = false;
        public units: Unit[];

        public addUnit(unit: Unit) {
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

        public get moveCommands(): MoveCommand[] {
            const moveCommands = this.units
                .map(unit => unit.command)
                .filter(command => command !== null && command.type === CommandType.MoveCommand)
                .map(moveCommand => <MoveCommand>moveCommand);

            return moveCommands;
        }

        public removeUnit(unit: Unit) {
            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                // TODO: Should check if it's a move command and not just any command.
                if (u.command !== null) {
                    throw "Cannot remove unit since it has a command assigned to it.";
                }

                u.cell = null;
            });

            this.units = this.units.filter(u => u !== unit);
        }
    }
}
