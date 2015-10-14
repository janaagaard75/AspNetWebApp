module Muep {
    "use strict";

    export class DemoSetup {
        public static addUnitsAndCommands(game: Game) {
            const redPlayer = game.players[0];
            const yellowPlayer = game.players[1];
            const greenPlayer = game.players[2];
            const cyanPlayer = game.players[3];
            const bluePlayer = game.players[4];
            const magentaPlayer = game.players[5];

            game.getCell(new Hex(3, 0, -3)).addUnit(new Unit(redPlayer));
            game.getCell(new Hex(3, -3, 0)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(0, -3, 3)).addUnit(new Unit(greenPlayer));
            game.getCell(new Hex(-3, 0, 3)).addUnit(new Unit(cyanPlayer));
            game.getCell(new Hex(-3, 3, 0)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(0, 3, -3)).addUnit(new Unit(magentaPlayer));

            game.getCell(new Hex(0, 0, 0)).addUnit(new Unit(redPlayer));
            game.getCell(new Hex(0, 0, 0)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(0, 0, 0)).addUnit(new Unit(greenPlayer));

            game.getCell(new Hex(0, -1, 1)).addUnit(new Unit(greenPlayer));
            game.getCell(new Hex(0, -1, 1)).addUnit(new Unit(greenPlayer));

            game.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));
            game.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));
            game.getCell(new Hex(-1, 0, 1)).addUnit(new Unit(cyanPlayer));

            game.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(-1, 1, 0)).addUnit(new Unit(yellowPlayer));

            game.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(0, 1, -1)).addUnit(new Unit(bluePlayer));

            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(redPlayer));
            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(yellowPlayer));
            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(greenPlayer));
            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(cyanPlayer));
            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(bluePlayer));
            game.getCell(new Hex(1, 0, -1)).addUnit(new Unit(magentaPlayer));

            for (let i = 0; i < 6; i++) {
                let r = 0;
                let s = 0;
                let t = 0;
                switch (i) {
                    case 0:
                        r = 1;
                        s = -1;
                        break;
                    case 1:
                        r = 1;
                        t = -1;
                        break;
                    case 2:
                        s = 1;
                        t = -1;
                        break;
                    case 3:
                        r = -1;
                        s = 1;
                        break;
                    case 4:
                        r = -1;
                        t = 1;
                        break;
                    case 5:
                        s = -1;
                        t = 1;
                        break;
                }

                const cyanUnit = new Unit(cyanPlayer);
                game.getCell(new Hex(2, -2, 0)).addUnit(cyanUnit);
                cyanUnit.setMoveCommand(game.getCell(new Hex(2 + r, -2 + s, 0 + t)));
            }

            for (let i = 0; i < 4; i++) {
                let from: Hex;
                if (i < 2) {
                    from = new Hex(0, 2, -2);
                } else {
                    from = new Hex(1, 2, -3);
                }

                const magentaUnit = new Unit(magentaPlayer);
                game.getCell(new Hex(1, 1, -2)).addUnit(magentaUnit);
                magentaUnit.setMoveCommand(game.getCell(from));
            }

            for (let i = 2; i <= 6; i++) {
                let to: Hex;
                switch (i) {
                    case 2:
                        to = new Hex(-2, 0, 2);
                        break;
                    case 3:
                        to = new Hex(-2, -1, 3);
                        break;
                    case 4:
                        to = new Hex(-1, -1, 2);
                        break;
                    case 5:
                        to = new Hex(-1, -2, 3);
                        break;
                    case 6:
                        to = new Hex(0, -2, 2);
                        break;
                }
                let from = new Hex(to.r + 1, to.s - 1, to.t);

                for (let j = 0; j < i; j++) {
                    const greenUnit = new Unit(greenPlayer);
                    game.getCell(to).addUnit(greenUnit);
                    greenUnit.setMoveCommand(game.getCell(from));
                }
            }
        }
    }
}