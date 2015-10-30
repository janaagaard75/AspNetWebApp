module CocaineCartels {
    "use strict";

    export interface IGroupByFunc<TItem, TKey> {
        (item: TItem): TKey;
    }
}
