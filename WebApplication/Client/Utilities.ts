module CocaineCartels {
    "use strict";

    export class Utilities {
        public static flatten<T>(doubleArray: Array<Array<T>>): Array<T> {
            const flattened = Array.prototype.concat.apply([], doubleArray);
            return flattened;
        }

        public static getUrlParameters(): IUrlParameters {
            var pl = /\+/g;  // Regex for replacing addition symbol with a space
            const search = /([^&=]+)=?([^&]*)/g;
            const decode = s => decodeURIComponent(s.replace(pl, " "));
            const query = window.location.search.substring(1);
            const parameters: IUrlParameters = {};

            let match: RegExpExecArray;
            while ((match = search.exec(query))) {
                parameters[decode(match[1])] = decode(match[2]);
            }

            return parameters;
        }

        // TODO j: Why is this returned as a double array and not an associative array?
        public static groupBy<TItem, TKey>(array: Array<TItem>, groupByFunc: IGroupByFunc<TItem, TKey>): Array<Array<TItem>> {
            var associativeArray: IGroups<TItem> = {};
            array.forEach(item => {
                var group = JSON.stringify(groupByFunc(item));
                if (associativeArray[group] === undefined) {
                    associativeArray[group] = [];
                }
                associativeArray[group].push(item);
            });
            const doubleArray = Object.keys(associativeArray).map(group => {
                return associativeArray[group];
            });
            return doubleArray;
        }

        /** Returns the points halfway between a and b. */
        public static midPoint(a: Konva.Vector2d, b: Konva.Vector2d): Pos {
            const mid = new Pos(
                (a.x + b.x) / 2,
                (a.y + b.y) / 2
            );
            return mid;
        }

        public static rotate90Degrees(vector: Konva.Vector2d): Pos {
            const rotated = new Pos(
                -vector.y,
                vector.x
            );
            return rotated;
        }

        /** Returns a union of two arrays of the same type that does not contain any duplicate items. */
        public static union<T>(array1: Array<T>, array2: Array<T>): Array<T> {
            var union: Array<T> = [];
            array1.forEach(item => {
                if (union.filter(i => i === item).length === 0) {
                    union.push(item);
                }
            });

            array2.forEach(item => {
                if (union.filter(i => i === item).length === 0) {
                    union.push(item);
                }
            });

            return union;
        }
    }
}
