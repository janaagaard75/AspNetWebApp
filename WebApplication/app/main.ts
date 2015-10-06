module Muep {
    "use strict";

    export class Main {
        constructor() {
            Settings.initialize();
            Main.game = new Game();
            Main.canvas = new Canvas(Main.game);
        }

        private static canvas: Canvas;
        private static game: Game;
    }
}
