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

        public get newUnits(): Array<Unit> {
            const newUnits = this.units.filter(u => u.cell === null);
            return newUnits;
        }

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
