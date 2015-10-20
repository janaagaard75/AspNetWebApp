module Muep {
    "use strict";

    export class Board {
        constructor(
            boardData: IBoard,
            gameInstance: Game
        ) {
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
