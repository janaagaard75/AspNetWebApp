module Muep {
    "use strict";

    export class Main {
        constructor() {
            this.setCanvasSize();
            Settings.initialize();
            Main.game = new Game();
            Main.canvas = new Canvas(Main.game);
        }

        private static canvas: Canvas;
        private static game: Game;

        private setCanvasSize() {
            const minSize = Math.min(window.innerWidth, window.innerHeight);
            const canvasSize = `${minSize}px`;
            const canvasElement = document.getElementById(Settings.canvasId);
            canvasElement.style.width = canvasSize;
            canvasElement.style.height = canvasSize;
        }
    }
}
