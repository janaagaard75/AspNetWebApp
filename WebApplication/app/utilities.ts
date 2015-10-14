module Muep {
    "use strict";

    export class Utilities {
        public static flatten<T>(doubleArray: T[][]): T[] {
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

        public static groupBy<T>(array: T[], groupByFunc: IGroupByFunc<T>): T[][] {
            var associativeArray: IGroups<T> = {};
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
    }
}
