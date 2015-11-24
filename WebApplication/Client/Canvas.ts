module CocaineCartels {
    "use strict";

    export class Canvas {
        constructor(
            private turn: Turn,
            private canvasId: string,
            private animated: boolean,
            private interactive: boolean
        ) {
            if (animated === true && interactive === true) {
                throw "A canvas cannot be both animated and interactive.";
            }

            if (turn !== null) {
                this.drawBoard();
            }
        }

        private boardLayer: Konva.Layer;
        private commandsLayer: Konva.Layer;
        private dragLayer: Konva.Layer;
        private movedUnitTweens: Array<Konva.Tween> = [];
        private newUnitTweens: Array<Konva.Tween> = [];
        private shapesWithEvents: Array<Konva.Shape> = [];
        private stage: Konva.Stage;
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
                strokeWidth: CanvasSettings.cellBorderWidth
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
            this.turn.cells.forEach(cell => {
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

            this.turn.cells.forEach(cell => {
                var groups = Utilities.groupByIntoArray(cell.moveCommandsFromCell, groupByFromAndTo);
                groups.forEach(commands => {
                    const oppositeCommands = this.turn.getMoveCommands(commands[0].to, commands[0].from);
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

            this.turn.newUnitsForPlayer(player).forEach((unit, unitIndex, units) => {
                if (unit.placeCommand === null) {
                    this.drawUnit(unit, pos, unitIndex, units.length);
                }
            });
        }

        private drawUnit(unit: Unit, pos: Pos, unitIndex: number, numberOfUnits: number) {
            const ownedByThisPlayer = (unit.player.color === Main.currentPlayer.color);

            const distanceBetweenUnits = CanvasSettings.cellRadius / numberOfUnits;
            const x = pos.x - (numberOfUnits - 1) * distanceBetweenUnits / 2 + unitIndex * distanceBetweenUnits;
            const overlapPos = new Pos(x, pos.y);
            const fillColor = (!this.animated && unit.moveCommand !== null) ? unit.movedColor : unit.color;
            const borderColor = ownedByThisPlayer ? "#000" : "#999";
            const borderWidth = CanvasSettings.unitBorderWidth;
            const scale = (this.animated && unit.newUnit) ? 1 / CanvasSettings.newUnitZoom : 1;
            const unitRadius = CanvasSettings.unitRadius;

            if (unit.circle === null) {
                const circle = new Konva.Circle({
                    draggable: this.interactive && ownedByThisPlayer,
                    fill: fillColor,
                    radius: unitRadius,
                    scaleX: scale,
                    scaleY: scale,
                    shadowBlur: 20,
                    shadowColor: "#000",
                    shadowEnabled: false,
                    shadowOpacity: 0.7,
                    stroke: borderColor,
                    strokeWidth: borderWidth,
                    x: overlapPos.x,
                    y: overlapPos.y
                });

                unit.circle = circle;
            } else {
                unit.circle.fill(fillColor);
                unit.circle.stroke(borderColor);
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

            if (this.animated) {
                if (unit.newUnit) {
                    const newUnitTween = new Konva.Tween({
                        node: unit.circle,
                        duration: CanvasSettings.newUnitTweenDuration,
                        scaleX: 1,
                        scaleY: 1,
                        easing: Konva.Easings.ElasticEaseOut
                    });

                    this.newUnitTweens.push(newUnitTween);
                }

                if (unit.moveCommand !== null) {
                    const newPos = unit.moveCommand.to.hex.pos;

                    const movedUnitTween = new Konva.Tween({
                        node: unit.circle,
                        duration: CanvasSettings.movedUnitTweenDuration,
                        x: newPos.x,
                        y: newPos.y,
                        easing: Konva.Easings.BackEaseIn
                    });

                    this.movedUnitTweens.push(movedUnitTween);
                }
            }
        }

        private drawUnits() {
            this.turn.cells.forEach(cell => {
                this.drawUnitsOnCell(cell);
            });

            Main.game.players.forEach((player, index, players) => {
                this.drawNewUnitsForPlayer(player, index, players.length);
            });
        }

        private drawUnitsOnCell(cell: Cell) {
            if (this.animated) {
                console.info("drawing animated unit.");
                const onCell = cell.units;
                const total = onCell.length;

                onCell.forEach((unit, index) => {
                    this.drawUnit(unit, cell.hex.pos, index, total);
                });
            } else {
                console.info("drawing interactive unit.");
                const staying = cell.unitsStaying;
                const toBeMovedHere = cell.unitsToBeMovedHere;
                const toBePlacedHere = cell.unitsToBePlacedHereAndNotMovedAway;

                const total = staying.length + toBeMovedHere.length + toBePlacedHere.length;

                staying.forEach((unit, index) => {
                    this.drawUnit(unit, cell.hex.pos, index, total);
                });

                const movingHereStartIndex = staying.length; //movedHereStartIndex + movedHere.length;
                toBeMovedHere.forEach((unit, index) => {
                    this.drawUnit(unit, cell.hex.pos, movingHereStartIndex + index, total);
                });

                const toBePlacedHereStartIndex = movingHereStartIndex + toBeMovedHere.length;
                toBePlacedHere.forEach((unit, index) => {
                    this.drawUnit(unit, cell.hex.pos, toBePlacedHereStartIndex + index, total);
                });
            }
        }

        private redrawBoard() {
            this.drawUnits();
            this.commandsLayer.destroyChildren();
            this.drawMoveCommands();
            this.stage.draw();
        }

        public replayLastTurn(): Promise<void> {
            // Reset all the tweens.
            this.newUnitTweens.concat(this.movedUnitTweens).forEach(tween => {
                tween.reset();
            });

            // Animate new units.
            this.newUnitTweens.forEach(tween => {
                tween.play();
            });

            setTimeout(() => {
                // Animate moves.
                this.movedUnitTweens.forEach(tween => {
                    tween.play();
                });
            }, CanvasSettings.newUnitTweenDuration + CanvasSettings.delayAfterTween * 1000)

            // 3. Animate battles.
            // 4. Animate points.

            // Switch back to the interactive canvas.
            const totalDelay = CanvasSettings.newUnitTweenDuration + CanvasSettings.delayAfterTween + CanvasSettings.movedUnitTweenDuration + CanvasSettings.delayAfterTween;
            var promise = new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, totalDelay * 1000);
            });

            return promise;
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

                unit = this.turn.allUnits.filter(u => u.circle === e.target)[0];

                var allowedCells: Array<Cell>;
                if (unit.cell === null) {
                    if (unit.placeCommand === null) {
                        allowedCells = this.turn.allowedCellsForPlace(unit);
                    } else {
                        allowedCells = this.turn.allowedCellsForPlace(unit).concat(this.turn.allowedCellsForMove(unit));
                    }
                } else {
                    allowedCells = this.turn.allowedCellsForMove(unit);
                }

                allowedCells.forEach(cell => {
                    cell.dropAllowed = true;
                    this.updateCellColor(cell);
                });

                this.unitsLayer.draw();
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
                    const currentCell = this.turn.nearestCell(new Pos(currentHexagon.x(), currentHexagon.y()));

                    if (currentCell.dropAllowed) {
                        if (unit.cell === null) {
                            if (unit.placeCommand === null) {
                                // It's a place.
                                unit.setPlaceCommand(currentCell);
                                Main.setCurrentPlayerNotReadyIfNecessary();
                            } else {
                                // This might be a re-place of a new unit.
                                const cellsAllowedForDrop = this.turn.allowedCellsForPlace(unit)
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

                this.turn.cells.forEach(cell => {
                    cell.dropAllowed = false;
                    this.updateCellColor(cell);
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
