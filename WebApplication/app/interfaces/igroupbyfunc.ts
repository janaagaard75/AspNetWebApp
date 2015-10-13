/// <reference path="../../_references.ts"/>

module Muep {
    "use strict";

    export interface IGroupByFunc<T> {
        (item: T): Object;
    }
}
