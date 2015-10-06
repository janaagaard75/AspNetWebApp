module Muep {
    "use strict";

    export class Hex {
        constructor(
            public r: number,
            public s: number,
            public t: number
        ) {
            const sum = r + s + t;
            if (sum !== 0) {
                throw `r + s + t must be equal to 0. It's ${sum}.`;
            }

            this.pos = Hex.hexToPos(this);
        }

        public pos: Pos;

        public equals(other: Hex): boolean {
            const equals = (this.r === other.r && this.s === other.s && this.t === other.t);
            return equals;
        }

        public static hexToPos(hex: Hex) {
            const center = {
                x: Constants.width / 2,
                y: Constants.height / 2
            };
            const x = center.x + Math.sqrt(3) * Constants.cellRadius * hex.r + Math.sqrt(3) / 2 * Constants.cellRadius * hex.t;
            const y = center.y + 1.5 * Constants.cellRadius * hex.t;
            const pos = new Pos(x, y);
            return pos;
        }
    }
}
