module Muep {
    "use strict";

    export class Canvas {
        constructor(
            game: Game
        ) {
            Canvas.game = game;

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

            this.dragLayer = new Konva.Layer({
                opacity: 0.5
            });
            this.stage.add(this.dragLayer);
        }

        private drawBoard() {
            const background = new Konva.Rect({
                x: 0,
                y: 0,
                width: Settings.width,
                height: Settings.height,
                fill: "#fff"
            });
            this.backgroundLayer.add(background);

            Canvas.game.cells.forEach(cell => {
                this.drawCell(cell);
            });
        }

        private drawCell(cell: Cell) {
            const hexagon = new Konva.RegularPolygon({
                x: cell.hex.pos.x,
                y: cell.hex.pos.y,
                radius: Settings.cellRadius,
                sides: 6,
                stroke: "#ccc",
                strokeWidth: Settings.lineWidth
            });

            cell.hexagon = hexagon;

            hexagon.on(HexagonEvent.dragEnter, e => {
                //console.info(`Drag entered cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = true;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            hexagon.on(HexagonEvent.dragLeave, e => {
                //console.info(`Drag left cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = false;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            this.boardLayer.add(hexagon);
        }

        private drawCommand(command: Command) {
            switch (command.type) {
                case CommandType.MoveCommand:
                    this.drawMoveCommand(<MoveCommand>command);
                    break;

                case CommandType.PlaceCommand:
                    this.drawPlaceCommand(<PlaceCommand>command);
                    break;

                default:
                    throw `The command type ${command.type} is not supported.`;
            }
        }

        private drawCommands() {
            Canvas.game.commands.forEach(command => {
                this.drawCommand(command);
            });
        }

        /** Currently redraws the game from scratch each time, re-adding all units and commands. */
        public drawGame() {
            this.stage = new Konva.Stage({
                container: Settings.canvasId,
                height: Settings.height,
                width: Settings.width
            });

            this.addLayers();

            this.drawBoard();
            this.drawUnits();
            this.drawCommands();

            this.stage.draw();
        }

        private drawMoveCommand(command: MoveCommand) {
            const arrow = new Konva["Arrow"]({
                fill: command.unit.commandColor,
                listening: false,
                pointerLength: Settings.arrowPointerLength,
                pointerWidth: Settings.arrowPointerWidth,
                points: [command.from.hex.pos.x, command.from.hex.pos.y, command.to.hex.pos.x, command.to.hex.pos.y],
                shadowBlur: Settings.arrowShadowBlurRadius,
                shadowColor: "#000",
                stroke: command.unit.commandColor,
                strokeWidth: Settings.arrowWidth,
                x: 0,
                y: 0
            });

            this.commandsLayer.add(arrow);
        }

        private drawPlaceCommand(command: PlaceCommand) {
            throw "drawPlaceCommand() is not yet implemented.";
        }

        private drawUnit(unit: Unit, unitIndex: number, numberOfUnits: number) {
            const x = unit.cell.hex.pos.x - (numberOfUnits - 1) * Settings.distanceBetweenUnits / 2 + unitIndex * Settings.distanceBetweenUnits;

            const circle = new Konva.Circle({
                draggable: true,
                fill: unit.color,
                radius: Settings.unitRadius,
                stroke: "#888",
                strokeWidth: Settings.lineWidth,
                x: x,
                y: unit.cell.hex.pos.y
            });

            /** Currently hovered hexagon. */
            var currentHexagon: Konva.Shape = null;
            /** Previously hovered hexagon.*/
            var previousHexagon: Konva.Shape = null;

            circle.on("dragstart", e => {
                e.target.moveTo(this.dragLayer);

                const allowedCells = Canvas.game.allowedCellsForMove(unit);
                allowedCells.forEach(cell => {
                    cell.dropAllowed = true;
                    this.updateCellColor(cell);
                });

                this.boardLayer.draw();
            });
            
            // Dragmove is called on every single pixel moved.
            circle.on("dragmove", e => {
                const pos = this.stage.getPointerPosition();

                currentHexagon = this.boardLayer.getIntersection(pos);
                if (currentHexagon !== null) {
                    // TODO: Either move the nearest-logic in here or make a direct link between each cell and each heaxgon.
                    const currentCell = Canvas.game.nearestCell(new Pos(currentHexagon.x(), currentHexagon.y()));
                    const distance = unit.cell.distance(currentCell);

                    if (distance === 0 || distance > unit.maximumMoveDistance) {
                        currentHexagon = null;
                    }
                }

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

                if (currentHexagon !== null) {
                    const from = unit.cell;
                    const event = <MouseEvent>e.evt;
                    const pos = new Pos(event.layerX, event.layerY);
                    const to = Canvas.game.nearestCell(pos);
                    const distance = from.distance(to);

                    if (from !== to && distance <= unit.maximumMoveDistance) {
                        //console.info(`Dragged ${unit.color} unit from (${from.hex.r},${from.hex.s},${from.hex.t}) to (${to.hex.r},${to.hex.s},${to.hex.t}).`);
                        // Move the unit and assign a new move command to it.
                        Canvas.game.moveUnit(unit, to);
                        unit.setMoveCommand(from, to);
                    }
                }

                currentHexagon = null;
                previousHexagon = null;

                Canvas.game.cells.forEach(cell => {
                    cell.dropAllowed = false;
                });

                this.drawGame();
            });

            circle.on("mouseover", () => {
                document.body.style.cursor = "move";
            });

            circle.on("mouseout", () => {
                document.body.style.cursor = "default";
            })

            this.unitsLayer.add(circle);
        }

        private drawUnits() {
            Canvas.game.cells.forEach(cell => {
                this.drawUnitsInCell(cell);
            });
        }

        private drawUnitsInCell(cell: Cell) {
            cell.units.forEach((unit, index) => {
                this.drawUnit(unit, index, cell.units.length);
            });
        }

        private updateCellColor(cell: Cell) {
            var backgroundColor: string;
            if (cell.hovered) {
                if (cell.dropAllowed) {
                    backgroundColor = "#ddd";
                } else {
                    // This should not happen.
                    backgroundColor = "#f99";
                }
            } else {
                if (cell.dropAllowed) {
                    backgroundColor = "#eee"
                } else {
                    backgroundColor = null;
                }
            }

            cell.hexagon.fill(backgroundColor);
        }
   }
}
