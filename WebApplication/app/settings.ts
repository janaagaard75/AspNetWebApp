module Muep {
    "use strict";

    export class Settings {
        public static arrowPointerLength = 4;
        public static arrowPointerWidth = 5;
        public static arrowShadowBlurRadius = 10;
        public static arrowWidth: number;
        public static canvasId = "canvas";
        public static cellRadius: number;
        public static gridSize = 3; // Set to minimum 3 if in demo mode. The command arrows aren't suited for values above 6.
        public static height: number;
        public static lineWidth: number;
        public static unitRadius: number;
        public static width: number;

        public static initialize() {
            const canvasElement = document.getElementById(Settings.canvasId);

            this.height = canvasElement.clientHeight;
            this.width = canvasElement.clientWidth;

            const boardSize = Math.min(this.height, this.width);

            this.cellRadius = boardSize / (2 * this.gridSize + 1) * 0.55;
            this.lineWidth = 1 + boardSize / 1000;

            this.arrowWidth = 2 * this.lineWidth;
            this.unitRadius = this.cellRadius / 2.2;
        }
    }
}
