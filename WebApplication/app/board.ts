module Muep {
    "use strict";

    export class Board {
        /** Call initializeUnits after the board has been initialized. */
        constructor(
            boardData: IBoard
        ) {
            // No units and commands initialized yet.
            this.cells = [];
            boardData.cells.forEach(cellData => {
                const cell = new Cell(cellData);
                this.cells.push(cell);
            });

            this.gridSize = boardData.gridSize;
        }

        public initializeUnits(gameInstance: Game) {
            this.cells.forEach(cell => {
                cell.initializeUnits(gameInstance);
            });
        }

        public cells: Cell[];
        public gridSize: number;
    }
}
