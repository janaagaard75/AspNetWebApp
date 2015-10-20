module Muep {
    "use strict";

    export class Board {
        constructor(boardData: IBoard) {
            boardData.cells.forEach(cellData => {
                const cell = new Cell(cellData);
                this.cells.push(cell);
            });

            this.gridSize = boardData.gridSize;
        }

        public cells: Cell[];
        public gridSize: number;
    }
}
