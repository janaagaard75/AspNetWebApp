/// <reference path="../_references.ts"/>

module Muep {
    "use strict";

    interface IGroups<T> {
        [index: string]: T[]
    }

    export class Utilities {
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
