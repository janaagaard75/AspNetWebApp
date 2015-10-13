module Muep {
    "use strict";

    /** Hexagon coordinates with r, s and t. */
    export class Hex {
        constructor(
            public r: number,
            public s: number,
            public t: number
        ) {
            const sum = r + s + t;
            if (sum !== 0) {
                throw `r + s + t must be equal to 0. The sum of (${r}, ${s}, ${t}) is ${sum}.`;
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
                x: Settings.width / 2,
                y: Settings.height / 2
            };
            const x = center.x + Math.sqrt(3) * Settings.cellRadius * hex.r + Math.sqrt(3) / 2 * Settings.cellRadius * hex.t;
            const y = center.y + 1.5 * Settings.cellRadius * hex.t;
            const pos = new Pos(x, y);
            return pos;
        }
    }
}
