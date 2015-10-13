module Muep {
    "use strict";

    export interface IGroupByFunc<T> {
        (item: T): Object;
    }
}
