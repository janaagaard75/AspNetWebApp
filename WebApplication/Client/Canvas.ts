module CocaineCartels {
    "use strict";

    export class Canvas {
        constructor(
            board: Turn,
            canvasId: string,
            interactive: boolean
        ) {
            this.shapesWithEvents = [];
            Canvas.board = board;
            this.canvasId = canvasId;
            this.interactive = interactive;
            if (board !== null) {
                this.drawBoard();
            }
        }

        private static board: Turn; // Has be to static to be accessible inside unitDragBound function.
        private stage: Konva.Stage;

        private boardLayer: Konva.Layer;
        private canvasId: string;
        private commandsLayer: Konva.Layer;
        private dragLayer: Konva.Layer;
        private interactive: boolean;
        private shapesWithEvents: Array<Konva.Shape>;
        private unitsLayer: Konva.Layer;

        private addLayers() {
            this.destroy();

            this.boardLayer = new Konva.Layer();
            this.stage.add(this.boardLayer);

            this.unitsLayer = new Konva.Layer();
            this.stage.add(this.unitsLayer);

            this.commandsLayer = new Konva.Layer();
            this.commandsLayer.hitGraphEnabled(false);
            this.stage.add(this.commandsLayer);

            this.dragLayer = new Konva.Layer();
            this.dragLayer.hitGraphEnabled(false);
            this.stage.add(this.dragLayer);
        }

        public destroy() {
            this.shapesWithEvents.forEach(shape => {
                shape.off("dragstart");
                shape.off("dragmove");
                shape.off("dragend");
                shape.off("mouseover");
                shape.off("mouseout");
                shape.listening(false);
                shape.destroy();
            });
            this.shapesWithEvents = [];

            if (this.boardLayer !== undefined) {
                this.commandsLayer.getChildren().each(node => {
                    node.destroy();
                });
                this.dragLayer.getChildren().each(node => {
                    node.destroy();
                });
                this.unitsLayer.getChildren().each(node => {
                    node.destroy();
                });

                this.boardLayer.destroy();
                this.commandsLayer.destroy();
                this.dragLayer.destroy();
                this.unitsLayer.destroy();
            }
        }

        /** Currently redraws the board from scratch each time, re-adding all units and commands. */
        private drawBoard() {
            this.stage = new Konva.Stage({
                container: this.canvasId,
                height: CanvasSettings.height,
                width: CanvasSettings.width
            });

            this.addLayers();

            // Draw methods are separated this way to match the layers in the game.
            this.drawCells();
            this.drawUnits();
            this.drawMoveCommands();
            this.setUpUnitDragEvents();

            this.stage.draw();
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
                cell.hovered = true;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            hexagon.on(HexagonEvent.dragLeave, () => {
                cell.hovered = false;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });

            this.boardLayer.add(hexagon);
        }

        private drawCells() {
            Canvas.board.cells.forEach(cell => {
                this.drawCell(cell);
            });
        }

        private drawMoveCommand(command: MoveCommand, index: number, numberOfCommands: number) {
            const halfways = Utilities.midPoint(command.from.hex.pos, command.to.hex.pos);
            const aFourth = Utilities.midPoint(command.from.hex.pos, halfways);
            const threeFourths = Utilities.midPoint(command.to.hex.pos, halfways);
            const from = Utilities.midPoint(command.from.hex.pos, threeFourths);
            const to = Utilities.midPoint(command.to.hex.pos, aFourth);

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
                perfectDrawEnabled: false,
                pointerLength: CanvasSettings.arrowPointerLength,
                pointerWidth: CanvasSettings.arrowPointerWidth,
                points: [from.x, from.y, to.x, to.y],
                shadowBlur: CanvasSettings.arrowShadowBlurRadius,
                shadowColor: "#999",
                stroke: command.color,
                strokeWidth: CanvasSettings.arrowWidth,
                transformsEnabled: 'position',
                x: origin.x,
                y: origin.y
            });

            this.commandsLayer.add(arrow);
        }

        private drawMoveCommands() {
            var groupByFromAndTo: IGroupByFunc<MoveCommand> = command => {
                return command.from.hex.toString() + command.to.hex.toString();
            }

            Canvas.board.cells.forEach(cell => {
                var groups = Utilities.groupByIntoArray(cell.moveCommandsFromCell, groupByFromAndTo);
                groups.forEach(commands => {
                    const oppositeCommands = Canvas.board.getMoveCommands(commands[0].to, commands[0].from);
                    const totalCommands = commands.length + oppositeCommands.length;
                    commands.forEach((command, index) => {
                        this.drawMoveCommand(command, index, totalCommands);
                    });
                });
            });
        }

        private drawNewUnitsForPlayer(player: Player, playerIndex: number, numberOfPlayers: number) {
            const pos = new Pos(
                (playerIndex + 1) * (CanvasSettings.width / (numberOfPlayers + 1)),
                CanvasSettings.width + CanvasSettings.spaceToNewUnits
            );

            Canvas.board.newUnitsForPlayer(player).forEach((unit, unitIndex, units) => {
                if (unit.placeCommand === null) {
                    this.drawUnit(unit, pos, unitIndex, units.length);
                }
            });
        }

        private drawUnit(unit: Unit, pos: Pos, unitIndex: number, numberOfUnits: number) {
            const ownedByThisPlayer = unit.player.color === Main.currentPlayer.color;

            const distanceBetweenUnits = CanvasSettings.cellRadius / numberOfUnits;
            const x = pos.x - (numberOfUnits - 1) * distanceBetweenUnits / 2 + unitIndex * distanceBetweenUnits;
            const overlapPos = new Pos(x, pos.y);
            const fillColor = unit.moveCommand === null ? unit.color : unit.placedColor;
            const strokeColor = (unit.cell === null || unit.placeCommand !== null) ? "#000" : "#999";

            if (unit.circle === null) {
                const circle = new Konva.Circle({
                    draggable: this.interactive && ownedByThisPlayer,
                    fill: fillColor,
                    radius: CanvasSettings.unitRadius,
                    shadowBlur: 20,
                    shadowColor: "#000",
                    shadowEnabled: false,
                    shadowOpacity: 0.7,
                    stroke: strokeColor,
                    strokeWidth: CanvasSettings.lineWidth,
                    x: overlapPos.x,
                    y: overlapPos.y
                });

                unit.circle = circle;
            } else {
                unit.circle.fill(fillColor);
                unit.circle.stroke(strokeColor);
                unit.circle.x(overlapPos.x);
                unit.circle.y(overlapPos.y);
                unit.circle.moveToTop();
            }

            /** Currently hovered hexagon. */
            var currentHexagon: Konva.Shape = null;
            
            /** Previously hovered hexagon.*/
            var previousHexagon: Konva.Shape = null;

            if (this.interactive && ownedByThisPlayer) {
                unit.circle.on("mouseover", () => {
                    document.body.classList.add("grab-cursor");
                });

                unit.circle.on("mouseout", () => {
                    document.body.classList.remove("grab-cursor");
                });

                this.shapesWithEvents.push(unit.circle);
            }

            this.unitsLayer.add(unit.circle);
        }

        private drawUnits() {
            Canvas.board.cells.forEach(cell => {
                this.drawUnitsOnCell(cell);
            });

            Main.game.players.forEach((player, index, players) => {
                this.drawNewUnitsForPlayer(player, index, players.length);
            });
        }

        private drawUnitsOnCell(cell: Cell) {
            const staying = cell.unitsStaying;
            const movedHere = cell.unitsMovedHere;
            const toBeMovedHere = cell.unitsToBeMovedHere;
            const toBePlacedHere = cell.unitsToBePlacedHereAndNotMovedAway;

            const total = staying.length + movedHere.length + toBeMovedHere.length + toBePlacedHere.length;

            staying.forEach((unit, index) => {
                this.drawUnit(unit, cell.hex.pos, index, total);
            });

            const movedHereStartIndex = staying.length;
            movedHere.forEach((unit, index) => {
                this.drawUnit(unit, cell.hex.pos, movedHereStartIndex + index, total);
            });

            const movingHereStartIndex = movedHereStartIndex + movedHere.length;
            toBeMovedHere.forEach((unit, index) => {
                this.drawUnit(unit, cell.hex.pos, movingHereStartIndex + index, total);
            });

            const toBePlacedHereStartIndex = movingHereStartIndex + toBeMovedHere.length;
            toBePlacedHere.forEach((unit, index) => {
                this.drawUnit(unit, cell.hex.pos, toBePlacedHereStartIndex + index, total);
            });
        }

        private redrawBoard() {
            this.drawUnits();
            this.commandsLayer.destroyChildren();
            this.drawMoveCommands();
            this.stage.draw();
        }

        private setUpUnitDragEvents() {
            /** Currently hovered hexagon. */
            var currentHexagon: Konva.Shape = null;
            
            /** Previously hovered hexagon.*/
            var previousHexagon: Konva.Shape = null;

            /** The unit being dragged. */
            var unit: Unit = null;

            this.stage.on("dragstart", e => {
                e.target.moveTo(this.dragLayer);
                e.target.shadowEnabled(true);
                document.body.classList.remove("grab-cursor");
                document.body.classList.add("grabbing-cursor");

                unit = Canvas.board.allUnits.filter(u => u.circle === e.target)[0];

                var allowedCells: Array<Cell>;
                if (unit.cell === null) {
                    if (unit.placeCommand === null) {
                        allowedCells = Canvas.board.allowedCellsForPlace(unit);
                    } else {
                        allowedCells = Canvas.board.allowedCellsForPlace(unit).concat(Canvas.board.allowedCellsForMove(unit));
                    }
                } else {
                    allowedCells = Canvas.board.allowedCellsForMove(unit);
                }

                allowedCells.forEach(cell => {
                    cell.dropAllowed = true;
                    this.updateCellColor(cell);
                });
            });
            
            this.stage.on("dragmove", () => {
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

            this.stage.on("dragend", e => {
                e.target.moveTo(this.unitsLayer);
                e.target.shadowEnabled(false);
                document.body.classList.remove("grabbing-cursor");

                if (currentHexagon !== null) {
                    const currentCell = Canvas.board.nearestCell(new Pos(currentHexagon.x(), currentHexagon.y()));

                    if (currentCell.dropAllowed) {
                        if (unit.cell === null) {
                            if (unit.placeCommand === null) {
                                // It's a place.
                                unit.setPlaceCommand(currentCell);
                                Main.setCurrentPlayerNotReadyIfNecessary();
                            } else {
                                // This might be a re-place of a new unit.
                                const cellsAllowedForDrop = Canvas.board.allowedCellsForPlace(unit)
                                if (cellsAllowedForDrop.filter(c => c === currentCell).length > 0) {
                                    // It's a re-place.
                                    unit.moveCommand = null;
                                    unit.setPlaceCommand(currentCell);
                                } else {
                                    // It's a move.
                                    let from: Cell;
                                    if (unit.cell === null) {
                                        from = unit.placeCommand.on;
                                    } else {
                                        from = unit.cell;
                                    }

                                    unit.setMoveCommand(from, currentCell);
                                }
                            }
                        } else {
                            // It's a move.
                            let from: Cell;
                            if (unit.cell === null) {
                                from = unit.placeCommand.on;
                            } else {
                                from = unit.cell;
                            }

                            unit.setMoveCommand(from, currentCell);
                        }

                        Main.setCurrentPlayerNotReadyIfNecessary();
                    }

                    currentCell.hovered = false;
                }

                Main.printNumberOfMovesLeft();

                currentHexagon = null;
                previousHexagon = null;

                Canvas.board.cells.forEach(cell => {
                    cell.dropAllowed = false;
                });

                this.redrawBoard();
            });
        }

        private updateCellColor(cell: Cell) {
            var backgroundColor: string;
            if (cell.dropAllowed) {
                if (cell.hovered) {
                    backgroundColor = "#afa";
                } else {
                    backgroundColor = "#dfd";
                }
            } else {
                backgroundColor = null;
            }

            cell.hexagon.fill(backgroundColor);
        }
    }
}
