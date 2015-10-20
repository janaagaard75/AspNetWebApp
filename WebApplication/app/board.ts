module Muep {
    "use strict";

    export class Board {
        constructor(
            boardData: IBoard,
            gameInstance: Game
        ) {
            // TODO: The cells have to be initialized before the move commands are. Otherwise the getCell command fails, when it's used by the constructor of the moveCommand. Fix this.

            this.cells = [];
            boardData.cells.forEach(cellData => {
                const cell = new Cell(cellData, gameInstance);
                this.cells.push(cell);
            });

            this.gridSize = boardData.gridSize;
        }

        public cells: Cell[];
        public gridSize: number;
    }
}
