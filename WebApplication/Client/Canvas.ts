module CocaineCartels {
    "use strict";

    export class Canvas {
        constructor(
            game: Game
        ) {
            Canvas.game = game;
            CanvasSettings.initialize(game.board.gridSize);
            this.drawGame();
        }

        private static game: Game; // Has be to static to be accessible inside unitDragBound function.
        private stage: Konva.Stage;

        private backgroundLayer: Konva.Layer;
        private boardLayer: Konva.Layer;
        private commandsLayer: Konva.Layer;
        private dragLayer: Konva.Layer;
        private unitsLayer: Konva.Layer;

        private addLayers() {
            this.backgroundLayer = new Konva.Layer();
            this.stage.add(this.backgroundLayer);

            this.boardLayer = new Konva.Layer();
            this.stage.add(this.boardLayer);

            this.unitsLayer = new Konva.Layer();
            this.stage.add(this.unitsLayer);

            this.commandsLayer = new Konva.Layer();
            this.stage.add(this.commandsLayer);

            this.dragLayer = new Konva.Layer();
            this.stage.add(this.dragLayer);
        }

        private drawBoard() {
            const background = new Konva.Rect({
                x: 0,
                y: 0,
                width: CanvasSettings.width,
                height: CanvasSettings.height,
                fill: "#fff"
            });
            this.backgroundLayer.add(background);

            Canvas.game.board.cells.forEach(cell => {
                this.drawCell(cell);
            });
        }

        private drawCell(cell: Cell) {
            const hexagon = new Konva.RegularPolygon({
                x: cell.hex.pos.x,
                y: cell.hex.pos.y,
                radius: CanvasSettings.cellRadius,
                sides: 6,
                stroke: "#ccc",
                strokeWidth: CanvasSettings.lineWidth
            });

            cell.hexagon = hexagon;

            hexagon.on(HexagonEvent.dragEnter, () => {
                //console.info(`Drag entered cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = true;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            hexagon.on(HexagonEvent.dragLeave, () => {
                //console.info(`Drag left cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = false;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            this.boardLayer.add(hexagon);
        }

        private drawCommands() {
            var groupByTo: IGroupByFunc<MoveCommand> = command => {
                return command.to.hex;
            }

            Canvas.game.board.cells.forEach(cell => {
                var groups = Utilities.groupBy(cell.moveCommandsFromCell, groupByTo);
                groups.forEach(commands => {
                    const oppositeCommands = Canvas.game.getMoveCommands(commands[0].to, commands[0].from);
                    const totalCommands = commands.length + oppositeCommands.length;
                    commands.forEach((command, index) => {
                        this.drawMoveCommand(command, index, totalCommands);
                    });
                });
            });
        }

        /** Currently redraws the game from scratch each time, re-adding all units and commands. */
        public drawGame() {
            this.stage = new Konva.Stage({
                container: CanvasSettings.canvasId,
                height: CanvasSettings.height,
                width: CanvasSettings.width
            });

            this.addLayers();

            this.drawBoard();
            this.drawUnits();
            this.drawCommands();

            this.stage.draw();
        }

        private drawMoveCommand(command: MoveCommand, index: number, numberOfCommands: number) {
            const midway = Utilities.midPoint(command.from.hex.pos, command.to.hex.pos);
            const from = Utilities.midPoint(command.from.hex.pos, midway);
            const to = Utilities.midPoint(command.to.hex.pos, midway);

            const d = new Pos(
                to.x - from.x,
                to.y - from.y
            );
            const offset = Utilities.rotate90Degrees(d).multiply(1 / numberOfCommands);
            const origin = new Pos(
                (numberOfCommands - 1) * offset.x / 2 - index * offset.x,
                (numberOfCommands - 1) * offset.y / 2 - index * offset.y
            );

            const arrow = new Konva["Arrow"]({
                fill: command.color,
                listening: false,
                pointerLength: CanvasSettings.arrowPointerLength,
                pointerWidth: CanvasSettings.arrowPointerWidth,
                points: [from.x, from.y, to.x, to.y],
                shadowBlur: CanvasSettings.arrowShadowBlurRadius,
                shadowColor: "#000",
                stroke: command.color,
                strokeWidth: CanvasSettings.arrowWidth,
                x: origin.x,
                y: origin.y
            });

            this.commandsLayer.add(arrow);
        }

        private drawPlaceCommand(command: PlaceCommand) {
            throw "drawPlaceCommand() is not yet implemented.";
        }

        private drawUnit(unit: Unit, pos: Pos, unitIndex: number, numberOfUnits: number, movedHere: boolean) {
            const distanceBetweenUnits = CanvasSettings.cellRadius / numberOfUnits;
            const x = pos.x - (numberOfUnits - 1) * distanceBetweenUnits / 2 + unitIndex * distanceBetweenUnits;
            const color = movedHere ? unit.movedColor : unit.color;

            const circle = new Konva.Circle({
                draggable: true,
                fill: color,
                radius: CanvasSettings.unitRadius,
                shadowBlur: 20,
                shadowColor: "#000",
                shadowEnabled: false,
                shadowOpacity: 0.7,
                stroke: "#888",
                strokeWidth: CanvasSettings.lineWidth,
                x: x,
                y: pos.y
            });

            /** Currently hovered hexagon. */
            var currentHexagon: Konva.Shape = null;
            
            /** Previously hovered hexagon.*/
            var previousHexagon: Konva.Shape = null;

            circle.on("dragstart", e => {
                e.target.moveTo(this.dragLayer);
                e.target.shadowEnabled(true);
                document.body.classList.remove("grab-cursor");
                document.body.classList.add("grabbing-cursor");

                var allowedCells: Array<Cell>;
                if (unit.cell === null) {
                    allowedCells = Canvas.game.allowedCellsForPlace(unit);
                } else {
                    allowedCells = Canvas.game.allowedCellsForMove(unit);
                }

                allowedCells.forEach(cell => {
                    cell.dropAllowed = true;
                    this.updateCellColor(cell);
                });

                this.boardLayer.draw();
                this.unitsLayer.draw();
            });
            
            // Dragmove is called on every single pixel moved.
            circle.on("dragmove", () => {
                const pos = this.stage.getPointerPosition();
                currentHexagon = this.boardLayer.getIntersection(pos);

                if (currentHexagon === previousHexagon) {
                    // Current same as previous: Don't change anything.
                    return;
                }

                if (currentHexagon === null) {
                    // Only previous defined: Moving out of a cell.
                    previousHexagon.fire(HexagonEvent.dragLeave);
                } else {
                    if (previousHexagon === null) {
                        // Only current defined: Moving into a cell.
                        currentHexagon.fire(HexagonEvent.dragEnter);
                    } else {
                        // Both cells defined and different: Moving from one cell to another.
                        previousHexagon.fire(HexagonEvent.dragLeave);
                        currentHexagon.fire(HexagonEvent.dragEnter);
                    }
                }

                previousHexagon = currentHexagon;
            });

            circle.on("dragend", e => {
                e.target.moveTo(this.unitsLayer);
                e.target.shadowEnabled(false);
                document.body.classList.remove("grabbing-cursor");

                if (currentHexagon !== null) {
                    const mouseEvent = <MouseEvent>e.evt;
                    const currentCell = Canvas.game.nearestCell(new Pos(mouseEvent.layerX, mouseEvent.layerY));

                    if (currentCell.dropAllowed) {
                        if (unit.cell === null) {
                            unit.setPlaceCommand(currentCell);
                            Canvas.game.moveUnit(unit, currentCell);
                        } else {
                            const from = unit.cell;
                            unit.setMoveCommand(from, currentCell);
                        }
                    }

                    currentCell.hovered = false;
                }

                currentHexagon = null;
                previousHexagon = null;

                Canvas.game.board.cells.forEach(cell => {
                    cell.dropAllowed = false;
                });

                // TODO j: Why is it not necessary to call updateCellColor here?

                this.drawGame();
            });

            circle.on("mouseover", () => {
                document.body.classList.add("grab-cursor");
            });

            circle.on("mouseout", () => {
                document.body.classList.remove("grab-cursor");
            });

            this.unitsLayer.add(circle);
        }

        private drawUnits() {
            Canvas.game.board.cells.forEach(cell => {
                this.drawUnitsOnCell(cell);
            });

            Canvas.game.players.forEach((player, index, players) => {
                this.drawNewUnitsForPlayer(player, index, players.length);
            });
        }

        private drawNewUnitsForPlayer(player: Player, playerIndex: number, numberOfPlayers: number) {
            const pos = new Pos(
                (playerIndex + 1) * (CanvasSettings.width / (numberOfPlayers + 1)),
                CanvasSettings.width + CanvasSettings.cellRadius // TODO j: Use another setting than cellRadius here.
            );

            player.newUnits.forEach((unit, unitIndex, units) => {
                this.drawUnit(unit, pos, unitIndex, units.length);
            });
        }

        private drawUnitsOnCell(cell: Cell) {
            const unitsToDisplay = cell.unitsToDisplay;

            unitsToDisplay.unitsToBeMovedHere.forEach((unit, index) => {
                
            });

            unitsToDisplay.unitsOnThisCell.forEach((unit, index) => {
                
            });

            cell.units.forEach((unit, index) => {
                this.drawUnit(unit, unit.cell.hex.pos, index, cell.units.length);
            });
        }

        private updateCellColor(cell: Cell) {
            var backgroundColor: string;
            if (cell.hovered) {
                if (cell.dropAllowed) {
                    backgroundColor = "#ddd";
                } else {
                    // Drop is not allowed. 
                    // TODO j: Remove this color once the drag and drop code is done.
                    backgroundColor = "#f99";
                }
            } else {
                if (cell.dropAllowed) {
                    backgroundColor = "#f3f3f3";
                } else {
                    backgroundColor = null;
                }
            }

            cell.hexagon.fill(backgroundColor);
        }
    }
}
