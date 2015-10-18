module Muep {
    "use strict";

    export class Player {
        constructor(
            playerData: IPlayer
        ) {
            this.color = playerData.color;
            this.units = [];
        }

        public color: string;
        public units: Unit[];
    }
}
