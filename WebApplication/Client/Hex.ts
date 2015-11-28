module CocaineCartels {
    "use strict";

    /** Hexagon coordinates with r, s and t. */
    export class Hex implements IHex {
        constructor(
            public r: number,
            public s: number,
            public t: number
        ) {
            const sum = r + s + t;
            if (sum !== 0) {
                throw `The sum of r, s and t must be equal to 0. ${r} + ${s} + ${t} is ${sum}.`;
            }
        }

        private _pos: Pos = null;

        public get pos(): Pos {
            if (this._pos === null) {
                this._pos = Hex.hexToPos(this);
            }

            return this._pos;
        }

        public equals(other: IHex): boolean {
            const equals = (this.r === other.r && this.s === other.s && this.t === other.t);
            return equals;
        }

        public static hexToPos(hex: Hex) {
            if (CanvasSettings.width == null || CanvasSettings.height == null || CanvasSettings.cellRadius == null) {
                throw "CanvasSettings haven't been initialized.";
            }

            const x = CanvasSettings.center.x + Math.sqrt(3) * CanvasSettings.cellRadius * hex.r + Math.sqrt(3) / 2 * CanvasSettings.cellRadius * hex.t;
            const y = CanvasSettings.center.y + 1.5 * CanvasSettings.cellRadius * hex.t;
            const pos = new Pos(x, y);
            return pos;
        }

        public toString(): string {
            const stringValue = `(${this.r},${this.s},${this.t})`;
            return stringValue;
        }
    }
}
