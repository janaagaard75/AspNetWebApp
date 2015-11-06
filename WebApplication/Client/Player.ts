module CocaineCartels {
    "use strict";

    // TODO j: Should players have links to their commands?
    export class Player {
        constructor(
            playerData: IPlayer
        ) {
            this.administrator = playerData.administrator;
            this.color = playerData.color;
            this.points = playerData.points;
            this.ready = playerData.ready;
            this.units = [];
        }

        public administrator: boolean;
        public color: string;
        public points: number;
        public ready: boolean;
        public units: Array<Unit>; // TODO j: The value is ambious since we not have multiple boards.

        public get newUnits(): Array<Unit> {
            const newUnits = this.units.filter(u => u.cell === null);
            return newUnits;
        }

        // TODO j: New units has to be added to a board instead of to a player.
        public addNewUnit(unitData: IUnit) {
            const newUnit = new Unit(unitData, null);
            // Can't use addUnit bause calling unit.player here fails when getPlayer is called.
            this.units.push(newUnit);
        }

        public addUnit(unit: Unit) {
            if (unit.player !== this) {
                throw "Trying to add a unit that belongs to another player.";
            }

            this.units.push(unit);
        }

        /** Returns the number of move commands that the current has assigned. */
        public get numberOfMoveCommands(): number {
            const numberOfMoveCommands = Main.game.moveCommands.filter(command => command.player.color === this.color).length;
            return numberOfMoveCommands;
        }

        public removeUnit(unit: Unit) {
            if (unit.player !== this) {
                throw "Trying to remove a unit that belongs to another player.";
            }

            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                u.deleteUnit();
            });
        }
    }
}
