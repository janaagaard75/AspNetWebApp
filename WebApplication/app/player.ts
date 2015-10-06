module Muep {
    "use strict";

    export class Player {
        constructor(
            public color: string
        ) {
            this.units = [];
        }

        public units: Unit[];
    }
}
