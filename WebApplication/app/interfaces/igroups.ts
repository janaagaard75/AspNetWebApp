module Muep {
    "use strict";

    export interface IGroups<T> {
        [index: string]: T[]
    }
}