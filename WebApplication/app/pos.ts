module Muep {
    "use strict";

    export class Pos implements Konva.Vector2d {
        constructor(
            public x: number,
            public y: number
        ) { }
    
        /** Returns the squared distance between two positions. */
        public distance(other: Konva.Vector2d) {
            const dist = Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
            return dist;
        }

        public getMultiplied(factor: number): Pos {
            const multiplied = new Pos(
                this.x * factor,
                this.y * factor
            );

            return multiplied;
        }

        public nearestHex(hexes: Hex[]): Hex {
            var minDist: number = null;
            var nearestHex: Hex;
            hexes.forEach(hex => {
                var dist = this.distance(hex.pos);
                if (minDist === null || dist < minDist) {
                    minDist = dist;
                    nearestHex = hex;
                }
            });

            return nearestHex;
        }
    }
}
