module CocaineCartels {
    "use strict";

    export class Player {
        constructor(
            playerData: IPlayer
        ) {
            this.color = playerData.color;
            this.units = [];
        }

        public color: string;
        public units: Array<Unit>;

        public addNewUnit(unitData: IUnit) {
            const newUnit = new Unit(unitData, null);
            // TODO j: Try using the addUnit method.
            this.units.push(newUnit);
        }

        public addUnit(unit: Unit) {
            if (unit.player !== this) {
                throw "Adding a unit to a player, but the unit's player is not this player.";
            }

            this.units.push(unit);
        }

        public get newUnits(): Array<Unit> {
            const newUnits = this.units.filter(u => u.cell === null);
            return newUnits;
        }
    }
}
