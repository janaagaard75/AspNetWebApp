module Muep {
    "use strict";

    export class Settings {
        public static arrowPointerLength = 4;
        public static arrowPointerWidth = 5;
        public static arrowShadowBlurRadius = 10;
        public static arrowWidth: number;
        public static canvasId = "canvas";
        public static cellRadius: number;
        public static distanceBetweenMoveCommands: number;
        public static distanceBetweenUnits: number;
        public static lineWidth: number;
        public static height: number;
        public static unitRadius: number;
        public static width: number;

        public static initialize() {
            const canvasElement = document.getElementById(Settings.canvasId);

            this.height = canvasElement.clientHeight;
            this.width = canvasElement.clientWidth;

            this.cellRadius = this.height / 12.5;
            this.distanceBetweenMoveCommands = this.height / 60;
            this.distanceBetweenUnits = this.height / 60;
            this.lineWidth = 1 + this.height / 1000;

            this.arrowWidth = 2 * this.lineWidth;
            this.unitRadius = this.cellRadius / 2.3;
        }
    }
}
