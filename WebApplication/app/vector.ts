module Muep {
    "use strict";

    /** Not to be confused with Konva's Vector2d, which is actually a point. */
    export class Vector {
        constructor(
            public from: Konva.Vector2d,
            public to: Konva.Vector2d
        ) { }

        /** Returns a new vector that is rotated 90 degrees counter clockwise. */
        public getRotated(): Vector {
            throw "Not implemented"; // TODO: Implement or delete.
        }
    }
}
