module CocaineCartels {
    "use strict";

    export interface IGroupByFunc<TItem> {
        (item: TItem): string;
    }
}
