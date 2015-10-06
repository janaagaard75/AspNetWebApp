module Muep {
    "use strict";

    export interface IPos {
        x: number;
        y: number;
    }

    export interface ITest {
        (pos: IPos): IPos
    }
}
