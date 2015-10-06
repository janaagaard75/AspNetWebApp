module Muep {
    "use strict";

    export class Settings {
        public static canvasId = "canvas";
        public static cellRadius: number;
        public static height: number;
        public static width: number;

        public static initialize() {
            const canvasElement = document.getElementById(Settings.canvasId);
            this.height = canvasElement.clientHeight;
            this.width = canvasElement.clientWidth;
            this.cellRadius = this.height / 12.5;
        }
    }
}
