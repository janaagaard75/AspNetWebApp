var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Canvas = (function () {
        function Canvas(board, canvasId, interactive) {
            this.shapesWithEvents = [];
            Canvas.board = board;
            this.canvasId = canvasId;
            this.interactive = interactive;
            if (board !== null) {
                this.drawBoard();
            }
        }
        Canvas.prototype.addLayers = function () {
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
        };
        Canvas.prototype.destroy = function () {
            this.shapesWithEvents.forEach(function (shape) {
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
                this.commandsLayer.getChildren().each(function (node) {
                    node.destroy();
                });
                this.dragLayer.getChildren().each(function (node) {
                    node.destroy();
                });
                this.unitsLayer.getChildren().each(function (node) {
                    node.destroy();
                });
                this.boardLayer.destroy();
                this.commandsLayer.destroy();
                this.dragLayer.destroy();
                this.unitsLayer.destroy();
            }
        };
        /** Currently redraws the board from scratch each time, re-adding all units and commands. */
        Canvas.prototype.drawBoard = function () {
            this.stage = new Konva.Stage({
                container: this.canvasId,
                height: CocaineCartels.CanvasSettings.height,
                width: CocaineCartels.CanvasSettings.width
            });
            this.addLayers();
            // Draw methods are separated this way to match the layers in the game.
            this.drawCells();
            this.drawUnits();
            this.drawMoveCommands();
            this.setUpUnitDragEvents();
            this.stage.draw();
        };
        Canvas.prototype.drawCell = function (cell) {
            var _this = this;
            var hexagon = new Konva.RegularPolygon({
                x: cell.hex.pos.x,
                y: cell.hex.pos.y,
                radius: CocaineCartels.CanvasSettings.cellRadius,
                sides: 6,
                stroke: "#ccc",
                strokeWidth: CocaineCartels.CanvasSettings.cellBorderWidth
            });
            cell.hexagon = hexagon;
            hexagon.on(CocaineCartels.HexagonEvent.dragEnter, function () {
                cell.hovered = true;
                _this.updateCellColor(cell);
                _this.boardLayer.draw();
            });
            hexagon.on(CocaineCartels.HexagonEvent.dragLeave, function () {
                cell.hovered = false;
                _this.updateCellColor(cell);
                _this.boardLayer.draw();
            });
            this.boardLayer.add(hexagon);
        };
        Canvas.prototype.drawCells = function () {
            var _this = this;
            Canvas.board.cells.forEach(function (cell) {
                _this.drawCell(cell);
            });
        };
        Canvas.prototype.drawMoveCommand = function (command, index, numberOfCommands) {
            var halfways = CocaineCartels.Utilities.midPoint(command.from.hex.pos, command.to.hex.pos);
            var aFourth = CocaineCartels.Utilities.midPoint(command.from.hex.pos, halfways);
            var threeFourths = CocaineCartels.Utilities.midPoint(command.to.hex.pos, halfways);
            var from = CocaineCartels.Utilities.midPoint(command.from.hex.pos, threeFourths);
            var to = CocaineCartels.Utilities.midPoint(command.to.hex.pos, aFourth);
            var d = new CocaineCartels.Pos(to.x - from.x, to.y - from.y);
            var offset = CocaineCartels.Utilities.rotate90Degrees(d).multiply(1 / numberOfCommands);
            var origin = new CocaineCartels.Pos((numberOfCommands - 1) * offset.x / 2 - index * offset.x, (numberOfCommands - 1) * offset.y / 2 - index * offset.y);
            var arrow = new Konva["Arrow"]({
                fill: command.color,
                listening: false,
                perfectDrawEnabled: false,
                pointerLength: CocaineCartels.CanvasSettings.arrowPointerLength,
                pointerWidth: CocaineCartels.CanvasSettings.arrowPointerWidth,
                points: [from.x, from.y, to.x, to.y],
                shadowBlur: CocaineCartels.CanvasSettings.arrowShadowBlurRadius,
                shadowColor: "#999",
                stroke: command.color,
                strokeWidth: CocaineCartels.CanvasSettings.arrowWidth,
                transformsEnabled: 'position',
                x: origin.x,
                y: origin.y
            });
            this.commandsLayer.add(arrow);
        };
        Canvas.prototype.drawMoveCommands = function () {
            var _this = this;
            var groupByFromAndTo = function (command) {
                return command.from.hex.toString() + command.to.hex.toString();
            };
            Canvas.board.cells.forEach(function (cell) {
                var groups = CocaineCartels.Utilities.groupByIntoArray(cell.moveCommandsFromCell, groupByFromAndTo);
                groups.forEach(function (commands) {
                    var oppositeCommands = Canvas.board.getMoveCommands(commands[0].to, commands[0].from);
                    var totalCommands = commands.length + oppositeCommands.length;
                    commands.forEach(function (command, index) {
                        _this.drawMoveCommand(command, index, totalCommands);
                    });
                });
            });
        };
        Canvas.prototype.drawNewUnitsForPlayer = function (player, playerIndex, numberOfPlayers) {
            var _this = this;
            var pos = new CocaineCartels.Pos((playerIndex + 1) * (CocaineCartels.CanvasSettings.width / (numberOfPlayers + 1)), CocaineCartels.CanvasSettings.width + CocaineCartels.CanvasSettings.spaceToNewUnits);
            Canvas.board.newUnitsForPlayer(player).forEach(function (unit, unitIndex, units) {
                if (unit.placeCommand === null) {
                    _this.drawUnit(unit, pos, unitIndex, units.length);
                }
            });
        };
        Canvas.prototype.drawUnit = function (unit, pos, unitIndex, numberOfUnits) {
            var isNewUnit = (unit.cell === null || unit.placeCommand !== null);
            var ownedByThisPlayer = (unit.player.color === CocaineCartels.Main.currentPlayer.color);
            var distanceBetweenUnits = CocaineCartels.CanvasSettings.cellRadius / numberOfUnits;
            var x = pos.x - (numberOfUnits - 1) * distanceBetweenUnits / 2 + unitIndex * distanceBetweenUnits;
            var overlapPos = new CocaineCartels.Pos(x, pos.y);
            var fillColor = unit.moveCommand === null ? unit.color : unit.placedColor;
            var borderColor = ownedByThisPlayer ? "#000" : "#999";
            var borderWidth = isNewUnit ? CocaineCartels.CanvasSettings.newUnitBorderWidth : CocaineCartels.CanvasSettings.unitBorderWidth;
            var unitRadius = CocaineCartels.CanvasSettings.unitRadius;
            if (unit.circle === null) {
                var circle = new Konva.Circle({
                    draggable: this.interactive && ownedByThisPlayer,
                    fill: fillColor,
                    radius: unitRadius,
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
            }
            else {
                unit.circle.fill(fillColor);
                unit.circle.stroke(borderColor);
                unit.circle.x(overlapPos.x);
                unit.circle.y(overlapPos.y);
                unit.circle.moveToTop();
            }
            /** Currently hovered hexagon. */
            var currentHexagon = null;
            /** Previously hovered hexagon.*/
            var previousHexagon = null;
            if (this.interactive && ownedByThisPlayer) {
                unit.circle.on("mouseover", function () {
                    document.body.classList.add("grab-cursor");
                });
                unit.circle.on("mouseout", function () {
                    document.body.classList.remove("grab-cursor");
                });
                this.shapesWithEvents.push(unit.circle);
            }
            this.unitsLayer.add(unit.circle);
        };
        Canvas.prototype.drawUnits = function () {
            var _this = this;
            Canvas.board.cells.forEach(function (cell) {
                _this.drawUnitsOnCell(cell);
            });
            CocaineCartels.Main.game.players.forEach(function (player, index, players) {
                _this.drawNewUnitsForPlayer(player, index, players.length);
            });
        };
        Canvas.prototype.drawUnitsOnCell = function (cell) {
            var _this = this;
            var staying = cell.unitsStaying;
            var movedHere = cell.unitsMovedHere;
            var toBeMovedHere = cell.unitsToBeMovedHere;
            var toBePlacedHere = cell.unitsToBePlacedHereAndNotMovedAway;
            var total = staying.length + movedHere.length + toBeMovedHere.length + toBePlacedHere.length;
            staying.forEach(function (unit, index) {
                _this.drawUnit(unit, cell.hex.pos, index, total);
            });
            var movedHereStartIndex = staying.length;
            movedHere.forEach(function (unit, index) {
                _this.drawUnit(unit, cell.hex.pos, movedHereStartIndex + index, total);
            });
            var movingHereStartIndex = movedHereStartIndex + movedHere.length;
            toBeMovedHere.forEach(function (unit, index) {
                _this.drawUnit(unit, cell.hex.pos, movingHereStartIndex + index, total);
            });
            var toBePlacedHereStartIndex = movingHereStartIndex + toBeMovedHere.length;
            toBePlacedHere.forEach(function (unit, index) {
                _this.drawUnit(unit, cell.hex.pos, toBePlacedHereStartIndex + index, total);
            });
        };
        Canvas.prototype.redrawBoard = function () {
            this.drawUnits();
            this.commandsLayer.destroyChildren();
            this.drawMoveCommands();
            this.stage.draw();
        };
        Canvas.prototype.setUpUnitDragEvents = function () {
            var _this = this;
            /** Currently hovered hexagon. */
            var currentHexagon = null;
            /** Previously hovered hexagon.*/
            var previousHexagon = null;
            /** The unit being dragged. */
            var unit = null;
            this.stage.on("dragstart", function (e) {
                e.target.moveTo(_this.dragLayer);
                e.target.shadowEnabled(true);
                document.body.classList.remove("grab-cursor");
                document.body.classList.add("grabbing-cursor");
                unit = Canvas.board.allUnits.filter(function (u) { return u.circle === e.target; })[0];
                var allowedCells;
                if (unit.cell === null) {
                    if (unit.placeCommand === null) {
                        allowedCells = Canvas.board.allowedCellsForPlace(unit);
                    }
                    else {
                        allowedCells = Canvas.board.allowedCellsForPlace(unit).concat(Canvas.board.allowedCellsForMove(unit));
                    }
                }
                else {
                    allowedCells = Canvas.board.allowedCellsForMove(unit);
                }
                allowedCells.forEach(function (cell) {
                    cell.dropAllowed = true;
                    _this.updateCellColor(cell);
                });
            });
            this.stage.on("dragmove", function () {
                var pos = _this.stage.getPointerPosition();
                currentHexagon = _this.boardLayer.getIntersection(pos);
                if (currentHexagon === previousHexagon) {
                    // Current same as previous: Don't change anything.
                    return;
                }
                if (currentHexagon === null) {
                    // Only previous defined: Moving out of a cell.
                    previousHexagon.fire(CocaineCartels.HexagonEvent.dragLeave);
                }
                else {
                    if (previousHexagon === null) {
                        // Only current defined: Moving into a cell.
                        currentHexagon.fire(CocaineCartels.HexagonEvent.dragEnter);
                    }
                    else {
                        // Both cells defined and different: Moving from one cell to another.
                        previousHexagon.fire(CocaineCartels.HexagonEvent.dragLeave);
                        currentHexagon.fire(CocaineCartels.HexagonEvent.dragEnter);
                    }
                }
                previousHexagon = currentHexagon;
            });
            this.stage.on("dragend", function (e) {
                e.target.moveTo(_this.unitsLayer);
                e.target.shadowEnabled(false);
                document.body.classList.remove("grabbing-cursor");
                if (currentHexagon !== null) {
                    var currentCell = Canvas.board.nearestCell(new CocaineCartels.Pos(currentHexagon.x(), currentHexagon.y()));
                    if (currentCell.dropAllowed) {
                        if (unit.cell === null) {
                            if (unit.placeCommand === null) {
                                // It's a place.
                                unit.setPlaceCommand(currentCell);
                                CocaineCartels.Main.setCurrentPlayerNotReadyIfNecessary();
                            }
                            else {
                                // This might be a re-place of a new unit.
                                var cellsAllowedForDrop = Canvas.board.allowedCellsForPlace(unit);
                                if (cellsAllowedForDrop.filter(function (c) { return c === currentCell; }).length > 0) {
                                    // It's a re-place.
                                    unit.moveCommand = null;
                                    unit.setPlaceCommand(currentCell);
                                }
                                else {
                                    // It's a move.
                                    var from;
                                    if (unit.cell === null) {
                                        from = unit.placeCommand.on;
                                    }
                                    else {
                                        from = unit.cell;
                                    }
                                    unit.setMoveCommand(from, currentCell);
                                }
                            }
                        }
                        else {
                            // It's a move.
                            var from;
                            if (unit.cell === null) {
                                from = unit.placeCommand.on;
                            }
                            else {
                                from = unit.cell;
                            }
                            unit.setMoveCommand(from, currentCell);
                        }
                        CocaineCartels.Main.setCurrentPlayerNotReadyIfNecessary();
                    }
                    currentCell.hovered = false;
                }
                CocaineCartels.Main.printNumberOfMovesLeft();
                currentHexagon = null;
                previousHexagon = null;
                Canvas.board.cells.forEach(function (cell) {
                    cell.dropAllowed = false;
                });
                _this.redrawBoard();
            });
        };
        Canvas.prototype.updateCellColor = function (cell) {
            var backgroundColor;
            if (cell.dropAllowed) {
                if (cell.hovered) {
                    backgroundColor = "#afa";
                }
                else {
                    backgroundColor = "#dfd";
                }
            }
            else {
                backgroundColor = null;
            }
            cell.hexagon.fill(backgroundColor);
        };
        return Canvas;
    })();
    CocaineCartels.Canvas = Canvas;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    // All these settings are related to the canvas.
    var CanvasSettings = (function () {
        function CanvasSettings() {
        }
        CanvasSettings.initialize = function (gridSize) {
            if (gridSize == null) {
                throw "gridSize must be defined.";
            }
            var gridGutterWidth = 30; // Also defined in variables.scss.
            var canvasButtonsRowHeight = 43; // Hard coded here, since it might be hidden.
            var availableHeight = $(window).height() - ($("#headerContainer").height() + canvasButtonsRowHeight);
            var availableWidth = $(document).width() / 2 - gridGutterWidth;
            var aspectRatio = 10 / 11; // A bit higher than wide to make space for the new units below the board.
            var neededWidthToMatchFullHeight = Math.round(availableHeight * aspectRatio);
            if (neededWidthToMatchFullHeight <= availableWidth) {
                this.height = availableHeight;
                this.width = neededWidthToMatchFullHeight;
            }
            else {
                var neededHeightToMatchFullWidth = Math.round(availableWidth / aspectRatio);
                this.height = neededHeightToMatchFullWidth;
                this.width = availableWidth;
            }
            var boardSize = Math.min(this.height, this.width);
            this.cellRadius = boardSize / (2 * gridSize + 1) * 0.55;
            this.cellBorderWidth = 1 + boardSize / 1000;
            this.spaceToNewUnits = 0;
            this.arrowWidth = 2 * this.cellBorderWidth;
            this.center = new CocaineCartels.Pos(this.width / 2, this.width / 2 - this.cellRadius / 3);
            this.unitBorderWidth = this.cellBorderWidth;
            this.unitRadius = this.cellRadius / 3;
            this.newUnitBorderWidth = 2 * this.unitBorderWidth;
        };
        CanvasSettings.arrowPointerLength = 4;
        CanvasSettings.arrowPointerWidth = 5;
        CanvasSettings.arrowShadowBlurRadius = 10;
        CanvasSettings.canvasIdTemplate = "canvas";
        return CanvasSettings;
    })();
    CocaineCartels.CanvasSettings = CanvasSettings;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Cell = (function () {
        function Cell(cellData, board) {
            this._units = undefined;
            this.dropAllowed = false;
            this.hovered = false;
            this._cellData = cellData;
            this.board = board;
            this.hex = new CocaineCartels.Hex(cellData.hex.r, cellData.hex.s, cellData.hex.t);
        }
        Object.defineProperty(Cell.prototype, "moveCommandsFromCell", {
            get: function () {
                var moveCommands = this.unitsAlreadyHereOrToBePlacedHere
                    .map(function (unit) { return unit.moveCommand; })
                    .filter(function (moveCommand) { return moveCommand !== null; });
                return moveCommands;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "moveCommandsToCell", {
            get: function () {
                var _this = this;
                var commands = CocaineCartels.Main.game.currentTurn.moveCommands.filter(function (moveCommand) { return moveCommand.to === _this; });
                return commands;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "units", {
            /** Units on this cell, not taking into account that some of them might have move commands to other cells. Units to be placed on this cell are not included. */
            get: function () {
                var _this = this;
                if (this._units === undefined) {
                    this._units = [];
                    this._cellData.units.forEach(function (unitData) {
                        var unit = new CocaineCartels.Unit(unitData, _this.board, _this);
                        _this.addUnit(unit);
                    });
                }
                return this._units;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsAlreadyHereOrToBePlacedHere", {
            /** Returns the units that were already here or to be placed on this cell. Units might be moved to another cell. */
            get: function () {
                var unitsAlreadyHereOrToBePlacedHere = this.units.concat(this.unitsToBePlacedHere);
                return unitsAlreadyHereOrToBePlacedHere;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsMovedHere", {
            /** Units on this cell that were move here. This type of units is only shown on the third board. */
            get: function () {
                var _this = this;
                var unitsMovedHere = this.units.filter(function (unit) { return unit.moveCommand !== null && unit.moveCommand.to === _this; });
                return unitsMovedHere;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsToBeMovedHere", {
            /** Units that have a move commands to this cell. Units might be new units that also have a place command. */
            get: function () {
                var unitsMovingHere = this.moveCommandsToCell.map(function (command) { return command.unit; });
                return unitsMovingHere;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsStaying", {
            /** Units already on the cell and not moved away. Does not include units that will be placed here. */
            get: function () {
                var unitsStaying = this.units.filter(function (unit) { return unit.moveCommand === null; });
                return unitsStaying;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsToBePlacedHere", {
            /** Returns the units to be placed on this cell. Units might be moved to another cell. */
            get: function () {
                var _this = this;
                var unitsToBeplacedHere = this.board.newUnits.filter(function (unit) {
                    return unit.placeCommand !== null && unit.placeCommand.on === _this;
                });
                return unitsToBeplacedHere;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Cell.prototype, "unitsToBePlacedHereAndNotMovedAway", {
            get: function () {
                var unitsToBePlacedHereAndNotMovedAway = this.unitsToBePlacedHere.filter(function (unit) { return unit.moveCommand === null; });
                return unitsToBePlacedHereAndNotMovedAway;
            },
            enumerable: true,
            configurable: true
        });
        Cell.prototype.addUnit = function (unit) {
            if (unit.cell !== null && unit.cell !== this) {
                throw "The unit is already placed on another cell.";
            }
            if (this.units.filter(function (u) { return u === unit; }).length > 0) {
                throw "The unit is already on the cell.";
            }
            this.units.push(unit);
            unit.cell = this;
        };
        /** Returns the Manhatten distance between this cell and another cell. See http://www.redblobgames.com/grids/hexagons/#distances */
        Cell.prototype.distance = function (other) {
            var distance = Math.max(Math.abs(this.hex.r - other.hex.r), Math.abs(this.hex.s - other.hex.s), Math.abs(this.hex.t - other.hex.t));
            return distance;
        };
        Cell.prototype.removeUnit = function (unit) {
            var unitsToRemove = this.units.filter(function (u) { return u === unit; });
            unitsToRemove.forEach(function (u) {
                u.cell = null;
            });
            this._units = this.units.filter(function (u) { return u !== unit; });
        };
        return Cell;
    })();
    CocaineCartels.Cell = Cell;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var ClientAllianceProposal = (function () {
        function ClientAllianceProposal(toPlayer) {
            this.toPlayer = toPlayer;
        }
        return ClientAllianceProposal;
    })();
    CocaineCartels.ClientAllianceProposal = ClientAllianceProposal;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var ClientCommands = (function () {
        function ClientCommands(allianceProposals, moveCommands, placeCommands) {
            this.allianceProposals = allianceProposals;
            this.moveCommands = moveCommands;
            this.placeCommands = placeCommands;
        }
        return ClientCommands;
    })();
    CocaineCartels.ClientCommands = ClientCommands;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var ClientMoveCommand = (function () {
        function ClientMoveCommand(from, to) {
            this.from = from;
            this.to = to;
        }
        return ClientMoveCommand;
    })();
    CocaineCartels.ClientMoveCommand = ClientMoveCommand;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var ClientPlaceCommand = (function () {
        function ClientPlaceCommand(on) {
            this.on = on;
        }
        return ClientPlaceCommand;
    })();
    CocaineCartels.ClientPlaceCommand = ClientPlaceCommand;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    (function (CommandType) {
        CommandType[CommandType["MoveCommand"] = 0] = "MoveCommand";
        CommandType[CommandType["PlaceCommand"] = 1] = "PlaceCommand";
    })(CocaineCartels.CommandType || (CocaineCartels.CommandType = {}));
    var CommandType = CocaineCartels.CommandType;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Command = (function () {
        function Command(type, unit) {
            this.type = type;
            this.unit = unit;
            if (unit == null) {
                throw "'unit' must be defined.";
            }
        }
        Object.defineProperty(Command.prototype, "player", {
            get: function () {
                return this.unit.player;
            },
            enumerable: true,
            configurable: true
        });
        return Command;
    })();
    CocaineCartels.Command = Command;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Game = (function () {
        function Game(currentTurnData, gameData) {
            var _this = this;
            this.players = [];
            gameData.players.forEach(function (playerData) {
                var player = new CocaineCartels.Player(playerData);
                _this.players.push(player);
            });
            if (gameData.previousTurn === null) {
                this.previousTurn = null;
            }
            else {
                this.previousTurn = new CocaineCartels.Turn(gameData.previousTurn);
            }
            if (gameData.previousTurnShowingPlaceCommands === null) {
                this.previousTurnWithPlaceCommands = null;
            }
            else {
                this.previousTurnWithPlaceCommands = new CocaineCartels.Turn(gameData.previousTurnShowingPlaceCommands);
            }
            if (gameData.previousTurnShowingMoveCommands === null) {
                this.previousTurnWithMoveCommands = null;
            }
            else {
                this.previousTurnWithMoveCommands = new CocaineCartels.Turn(gameData.previousTurnShowingMoveCommands);
            }
            this.currentTurn = new CocaineCartels.Turn(currentTurnData);
            this.started = gameData.started;
        }
        /** Returns the player with the specified color. Returns null if the player wasn't found. */
        Game.prototype.getPlayer = function (playerColor) {
            var players = this.players.filter(function (p) { return p.color === playerColor; });
            if (players.length === 0) {
                return null;
            }
            return players[0];
        };
        /** Hacky solution for initializing the boards. */
        Game.prototype.initializeBoard = function (board) {
            if (board === null) {
                return;
            }
            // Initialize the units on the board.
            // ReSharper disable once QualifiedExpressionMaybeNull
            board.cells.forEach(function (cell) {
                cell.units.forEach(function (unit) {
                    // ReSharper disable once WrongExpressionStatement
                    unit.player;
                });
            });
            board.newUnits.forEach(function (unit) {
                // ReSharper disable once WrongExpressionStatement
                unit.player;
            });
        };
        return Game;
    })();
    CocaineCartels.Game = Game;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var GameService = (function () {
        function GameService() {
        }
        GameService.getCurrentPlayer = function () {
            return CocaineCartels.HttpClient.get("/api/currentplayercolor").then(function (color) {
                return color;
            });
        };
        GameService.getGameState = function () {
            return CocaineCartels.HttpClient.get("/api/gamestate").then(function (gameStateData) {
                var gameState = new CocaineCartels.GameState(gameStateData);
                return gameState;
            });
        };
        GameService.getStatus = function () {
            return CocaineCartels.HttpClient.get("/api/status");
        };
        GameService.notReady = function () {
            return CocaineCartels.HttpClient.get("/api/notready");
        };
        GameService.resetGame = function () {
            return CocaineCartels.HttpClient.get("/api/reset");
        };
        GameService.sendCommands = function (commands) {
            return CocaineCartels.HttpClient.post("/api/commands", commands);
        };
        GameService.setAllPlayersSeemToBeHere = function (allSeemToBeHere) {
            return CocaineCartels.HttpClient.get("/api/setallplayershere/" + allSeemToBeHere);
        };
        return GameService;
    })();
    CocaineCartels.GameService = GameService;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var GameState = (function () {
        function GameState(gameStateData) {
            this.gameInstance = new CocaineCartels.Game(gameStateData.currentTurn, gameStateData.gameInstance);
            this.currentPlayer = this.gameInstance.getPlayer(gameStateData.currentPlayerColor);
        }
        return GameState;
    })();
    CocaineCartels.GameState = GameState;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    /** Hexagon coordinates with r, s and t. */
    var Hex = (function () {
        function Hex(r, s, t) {
            this.r = r;
            this.s = s;
            this.t = t;
            this._pos = null;
            var sum = r + s + t;
            if (sum !== 0) {
                throw "The sum of r, s and t must be equal to 0. " + r + " + " + s + " + " + t + " is " + sum + ".";
            }
        }
        Object.defineProperty(Hex.prototype, "pos", {
            get: function () {
                if (this._pos === null) {
                    this._pos = Hex.hexToPos(this);
                }
                return this._pos;
            },
            enumerable: true,
            configurable: true
        });
        Hex.prototype.equals = function (other) {
            var equals = (this.r === other.r && this.s === other.s && this.t === other.t);
            return equals;
        };
        Hex.hexToPos = function (hex) {
            if (CocaineCartels.CanvasSettings.width == null || CocaineCartels.CanvasSettings.height == null || CocaineCartels.CanvasSettings.cellRadius == null) {
                throw "CanvasSettings haven't been initialized.";
            }
            var x = CocaineCartels.CanvasSettings.center.x + Math.sqrt(3) * CocaineCartels.CanvasSettings.cellRadius * hex.r + Math.sqrt(3) / 2 * CocaineCartels.CanvasSettings.cellRadius * hex.t;
            var y = CocaineCartels.CanvasSettings.center.y + 1.5 * CocaineCartels.CanvasSettings.cellRadius * hex.t;
            var pos = new CocaineCartels.Pos(x, y);
            return pos;
        };
        Hex.prototype.toString = function () {
            var stringValue = "(" + this.r + "," + this.s + this.t + ")";
            return stringValue;
        };
        return Hex;
    })();
    CocaineCartels.Hex = Hex;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var HexagonEvent = (function () {
        function HexagonEvent() {
        }
        HexagonEvent.dragEnter = "dragenter";
        HexagonEvent.dragLeave = "dragleave";
        return HexagonEvent;
    })();
    CocaineCartels.HexagonEvent = HexagonEvent;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var HttpMethod;
    (function (HttpMethod) {
        HttpMethod[HttpMethod["Get"] = 0] = "Get";
        HttpMethod[HttpMethod["Post"] = 1] = "Post";
    })(HttpMethod || (HttpMethod = {}));
    var HttpClient = (function () {
        function HttpClient() {
        }
        HttpClient.ajax = function (method, url, errorMessage, data) {
            var jsonData = null;
            if (data != null) {
                jsonData = JSON.stringify(data);
            }
            var promise = new Promise(function (resolve, reject) {
                var client = new XMLHttpRequest();
                client.timeout = 10 * 1000; // 10 seconds timeout as stardard.
                client.responseType = "json";
                client.open(method === HttpMethod.Get ? "GET" : "POST", url);
                if (method === HttpMethod.Post) {
                    client.setRequestHeader("Content-Type", "application/json");
                }
                client.send(jsonData);
                client.onload = function () {
                    var object = client.response;
                    if (object === null) {
                        if (client.status !== 200 && client.status !== 204) {
                            reject("Status is " + client.status + " " + client.statusText + ". Only 200 OK and 204 No Content are supported when a null is returned.");
                        }
                    }
                    else {
                        if (client.status !== 200) {
                            reject("Status is " + client.status + " " + client.statusText + ". Only 200 OK is supported when a value is returned.");
                        }
                    }
                    resolve(object);
                };
                client.onerror = function () {
                    reject("Error " + errorMessage + " '" + url + "': " + client.statusText + ".");
                };
            });
            return promise;
        };
        HttpClient.get = function (url) {
            var promise = HttpClient.ajax(HttpMethod.Get, url, "getting data from");
            return promise;
        };
        HttpClient.post = function (url, data) {
            var promise = HttpClient.ajax(HttpMethod.Post, url, "posting data to", data);
            return promise;
        };
        return HttpClient;
    })();
    CocaineCartels.HttpClient = HttpClient;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    (function (TurnMode) {
        TurnMode[TurnMode["Undefined"] = 0] = "Undefined";
        TurnMode[TurnMode["PlanMoves"] = 1] = "PlanMoves";
        TurnMode[TurnMode["ProposeAlliances"] = 2] = "ProposeAlliances";
        TurnMode[TurnMode["StartGame"] = 3] = "StartGame";
    })(CocaineCartels.TurnMode || (CocaineCartels.TurnMode = {}));
    var TurnMode = CocaineCartels.TurnMode;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Main = (function () {
        function Main() {
            CocaineCartels.CanvasSettings.initialize(CocaineCartels.Settings.gridSize);
            this.refreshGame();
        }
        Main.prototype.allPlayersSeemToBeHereClicked = function () {
            Main.currentPlayer.ready = !Main.currentPlayer.ready;
            CocaineCartels.GameService.setAllPlayersSeemToBeHere(Main.currentPlayer.ready);
            if (Main.currentPlayer.ready) {
                $("#allPlayersSeemToBeHereButton").addClass("active");
            }
            else {
                $("#allPlayersSeemToBeHereButton").removeClass("active");
            }
            this.printStartPlayersReady();
        };
        Main.prototype.allPlayersAreReady = function () {
            var playersWhoAreNotReady = Main.game.players.filter(function (player) { return !player.ready; }).length;
            return playersWhoAreNotReady === 0;
        };
        Main.prototype.confirmResetGame = function () {
            if (Main.game !== undefined && Main.game.started) {
                if (!window.confirm("Sure you want to reset the game?")) {
                    return;
                }
            }
            this.resetGame();
        };
        Main.prototype.isInDemoMode = function () {
            var paramters = CocaineCartels.Utilities.getUrlParameters();
            var mode = paramters["mode"];
            var inDemoMode = mode === "demo";
            return inDemoMode;
        };
        Main.prototype.getCanvasId = function (canvasNumber) {
            var canvasId = "" + CocaineCartels.CanvasSettings.canvasIdTemplate + canvasNumber;
            return canvasId;
        };
        Main.getPlayerLabel = function (player, emptyIfNotReady) {
            if (emptyIfNotReady && !player.ready) {
                return "<span class=\"label label-border\" style=\"border-color: " + player.color + ";\">&nbsp;&nbsp;&nbsp;</span>";
            }
            else {
                return "<span class=\"label label-border\" style=\"border-color: " + player.color + "; background-color: " + player.color + ";\">&nbsp;&nbsp;&nbsp;</span>";
            }
        };
        Main.getTurnModeString = function (turnMode) {
            switch (Main.game.currentTurn.mode) {
                case CocaineCartels.TurnMode.PlanMoves:
                    return "Plan moves";
                case CocaineCartels.TurnMode.ProposeAlliances:
                    return "Propose alliances";
                case CocaineCartels.TurnMode.StartGame:
                    return "Start game lobby";
                default:
                case CocaineCartels.TurnMode.Undefined:
                    return "Unknown";
            }
        };
        Main.printAllianceCheckboxes = function () {
            switch (Main.game.currentTurn.mode) {
                case CocaineCartels.TurnMode.ProposeAlliances:
                    var allOtherPlayers = Main.game.players.filter(function (p) { return p !== Main.currentPlayer; });
                    var allianceCheckboxes = allOtherPlayers
                        .map(function (player) {
                        var playerButton = "<div class=\"checkbox\"><label><input type=\"checkbox\" value=\"" + player.color + "\" onclick=\"cocaineCartels.toggleProposeAllianceWith();\" class=\"jsAllianceProposal\" /> <span style=\"color: " + player.color + "\">" + player.name + "</span></label></div>";
                        return playerButton;
                    })
                        .join(" ");
                    $("#allianceCheckboxes").html(allianceCheckboxes);
                    $("#alliances").removeClass("hidden");
                    break;
                default:
                    $("#alliances").addClass("hidden");
            }
        };
        Main.printNumberOfMovesLeft = function () {
            var numberOfMovesLeft = CocaineCartels.Settings.movesPerTurn - Main.currentPlayer.numberOfMoveCommands;
            document.getElementById("numberOfMovesLeft").innerHTML = numberOfMovesLeft.toString();
            var movesElement = document.getElementById("moves");
            if (numberOfMovesLeft < 0) {
                movesElement.classList.add("label", "label-danger");
            }
            else {
                movesElement.classList.remove("label", "label-danger");
            }
        };
        Main.printPlayersPoints = function (showLastTurnsPoints) {
            var playersPoints = Main.game.players.map(function (player) {
                var points;
                var addedPoints;
                if (showLastTurnsPoints) {
                    points = player.points - player.pointsLastTurn;
                    addedPoints = "";
                }
                else {
                    points = player.points;
                    addedPoints = "+" + player.pointsLastTurn;
                }
                var playerPoints = "<table style=\"display: inline-block\"><tr><td><span class=\"label\" style=\"background-color: " + player.color + "; color: #fff;\">" + points + "</span></td></tr><tr><td>" + addedPoints + "</td></tr></table>";
                return playerPoints;
            });
            $("#playersPoints").html(playersPoints.join(" "));
        };
        Main.printPlayersStatus = function () {
            var playersStatus = Main.game.players
                .map(function (player) {
                return Main.getPlayerLabel(player, true);
            })
                .join(" ");
            document.getElementById("playersStatus").innerHTML = playersStatus;
        };
        Main.prototype.printStartPage = function () {
            $("#startNumberOfPlayers").val(Main.game.players.length.toString());
            $("#startPlayerColor").html(Main.getPlayerLabel(Main.currentPlayer, false));
            this.printStartPlayersReady();
        };
        Main.prototype.printStartPlayersReady = function () {
            var playersColors = Main.game.players.map(function (player) { return Main.getPlayerLabel(player, true); }).join(" ");
            $("#startPlayersColors").html(playersColors);
        };
        Main.prototype.printTurnMode = function () {
            var turnMode = Main.getTurnModeString(Main.game.currentTurn.mode);
            $("#turnMode").html(turnMode);
        };
        Main.prototype.printTurnNumber = function () {
            var turnNumber = Main.game.currentTurn.turnNumber.toString();
            $("#turnNumber").html(turnNumber);
        };
        Main.prototype.refreshGame = function () {
            var _this = this;
            this.updateGameState().then(function () {
                var widthInPixels = CocaineCartels.CanvasSettings.width + "px";
                if (Main.game.started) {
                    if (_this.canvas1 !== undefined) {
                        _this.canvas1.destroy();
                        _this.canvas2.destroy();
                        _this.canvas3.destroy();
                        _this.canvas4.destroy();
                    }
                    _this.canvas1 = new CocaineCartels.Canvas(Main.game.previousTurn, _this.getCanvasId(1), false);
                    _this.canvas2 = new CocaineCartels.Canvas(Main.game.previousTurnWithPlaceCommands, _this.getCanvasId(2), false);
                    _this.canvas3 = new CocaineCartels.Canvas(Main.game.previousTurnWithMoveCommands, _this.getCanvasId(3), false);
                    _this.canvas4 = new CocaineCartels.Canvas(Main.game.currentTurn, _this.getCanvasId(4), Main.game.currentTurn.mode === CocaineCartels.TurnMode.PlanMoves);
                    $("#playerColor").html(Main.getPlayerLabel(Main.currentPlayer, false));
                    $(".commands").css("width", widthInPixels);
                    if (Main.game.started) {
                        $("#readyButton").prop("disabled", false);
                        $("#startGameButton").prop("disabled", true);
                        $("#startGameButton").attr("title", "The game is already started.");
                        if (Main.currentPlayer.ready) {
                            $("#readyButton").addClass("active");
                        }
                        else {
                            $("#readyButton").removeClass("active");
                        }
                    }
                    else {
                        $("#readyButton").prop("disabled", true);
                        $("#startGameButton").prop("disabled", false);
                        $("#startGameButton").removeAttr("title");
                    }
                    Main.printNumberOfMovesLeft();
                    Main.printPlayersStatus();
                    Main.printPlayersPoints(false);
                    Main.printAllianceCheckboxes();
                    _this.setActiveBoard(4);
                    var enableFirstThreeBoards = (Main.game.currentTurn.turnNumber >= 2);
                    for (var i = 1; i <= 3; i++) {
                        var boardButtonId = "#boardButton" + i;
                        $(boardButtonId).prop("disabled", !enableFirstThreeBoards);
                    }
                    $("#gameStarted").removeClass("hidden");
                    $("#gameStopped").addClass("hidden");
                }
                else {
                    $("#gameStartLobby").css("width", widthInPixels);
                    $("#gameStarted").addClass("hidden");
                    $("#gameStopped").removeClass("hidden");
                }
                _this.printTurnNumber();
                _this.printTurnMode();
                $("#administratorCommands").removeClass("hidden");
                _this.printStartPage();
                window.setTimeout(function () { return _this.tick(); }, 1000);
            });
        };
        Main.prototype.reloadPage = function () {
            window.location.reload();
        };
        Main.prototype.resetGame = function () {
            var _this = this;
            CocaineCartels.GameService.resetGame().then(function () {
                _this.reloadPage();
            });
        };
        Main.prototype.readyButtonClicked = function () {
            if (Main.currentPlayer.ready) {
                Main.setCurrentPlayerNotReady();
            }
            else {
                var readyButtonElement = document.getElementById("readyButton");
                var exceeding = Main.currentPlayer.numberOfMoveCommands - CocaineCartels.Settings.movesPerTurn;
                if (exceeding > 0) {
                    alert("Only up to " + CocaineCartels.Settings.movesPerTurn + " moves are allowed. Please remove some moves and click the ready button again.");
                    readyButtonElement.blur();
                    return;
                }
                readyButtonElement.classList.add("active");
                readyButtonElement.blur();
                this.sendCommands();
            }
        };
        Main.prototype.sendCommands = function () {
            var commands;
            switch (Main.game.currentTurn.mode) {
                case CocaineCartels.TurnMode.PlanMoves:
                    commands = this.getMoveCommands();
                    break;
                case CocaineCartels.TurnMode.ProposeAlliances:
                    commands = this.getAllianceProposalCommands();
                    break;
                default:
                    throw Main.game.currentTurn.mode + " is not supported.";
            }
            CocaineCartels.GameService.sendCommands(commands)
                .then(function () {
                // This might cause a blinking of the player's status if there is currently a status update in the pipeline.
                Main.currentPlayer.ready = true;
                Main.printPlayersStatus();
            })
                .catch(function (e) {
                alert("Error sending commands: " + e + ".");
            });
        };
        Main.prototype.getAllianceProposalCommands = function () {
            var proposals = [];
            $(".jsAllianceProposal").each(function (index, checkbox) {
                if ($(checkbox).prop("checked")) {
                    var proposal = new CocaineCartels.ClientAllianceProposal($(checkbox).val());
                    proposals.push(proposal);
                }
            });
            var commands = new CocaineCartels.ClientCommands(proposals, null, null);
            return commands;
        };
        Main.prototype.getMoveCommands = function () {
            var currentPlayersUnitsOnBoardOrToBePlacedOnBoard = Main.game.currentTurn.unitsOnBoardOrToBePlacedOnBoard.filter(function (unit) { return unit.player.color === Main.currentPlayer.color; });
            var moveCommands = currentPlayersUnitsOnBoardOrToBePlacedOnBoard
                .filter(function (unit) { return unit.moveCommand !== null; })
                .map(function (unit) { return new CocaineCartels.ClientMoveCommand(unit.moveCommand.from.hex, unit.moveCommand.to.hex); });
            var currentPlayersNewUnits = Main.game.currentTurn.newUnits.filter(function (unit) { return unit.player.color === Main.currentPlayer.color; });
            var placeCommands = currentPlayersNewUnits
                .filter(function (unit) { return unit.placeCommand !== null; })
                .map(function (unit) { return new CocaineCartels.ClientPlaceCommand(unit.placeCommand.on.hex); });
            var commands = new CocaineCartels.ClientCommands(null, moveCommands, placeCommands);
            return commands;
        };
        Main.prototype.setActiveBoard = function (activeBoard) {
            this.activeBoard = activeBoard;
            for (var i = 1; i <= 4; i++) {
                var canvasElement = document.getElementById(this.getCanvasId(i));
                var buttonElement = document.getElementById("boardButton" + i);
                if (i === this.activeBoard) {
                    canvasElement.classList.remove("hidden");
                    buttonElement.classList.add("active");
                }
                else {
                    canvasElement.classList.add("hidden");
                    buttonElement.classList.remove("active");
                }
            }
        };
        Main.setCurrentPlayerNotReady = function () {
            var readyButtonElement = document.getElementById("readyButton");
            readyButtonElement.classList.remove("active");
            readyButtonElement.blur();
            CocaineCartels.GameService.notReady().then(function () {
                Main.currentPlayer.ready = false;
                Main.printPlayersStatus();
            });
        };
        Main.setCurrentPlayerNotReadyIfNecessary = function () {
            if (Main.currentPlayer.ready) {
                Main.setCurrentPlayerNotReady();
            }
        };
        Main.prototype.toggleProposeAllianceWith = function () {
            Main.currentPlayer.ready = false;
        };
        Main.prototype.tick = function () {
            var _this = this;
            CocaineCartels.GameService.getStatus().then(function (status) {
                if (Main.game.currentTurn.turnNumber !== status.turnNumber) {
                    _this.refreshGame();
                    return;
                }
                if (Main.game.started) {
                    // If the game has been started, just update the players' ready status.
                    status.players.forEach(function (playerData) {
                        var player = Main.game.getPlayer(playerData.color);
                        player.ready = playerData.ready;
                    });
                    Main.printPlayersStatus();
                }
                else {
                    var updateListOfPlayers = false;
                    if (status.players.length !== Main.game.players.length) {
                        updateListOfPlayers = true;
                    }
                    else {
                        for (var i = 0; i < Main.game.players.length; i++) {
                            if (Main.game.players[i].color !== status.players[i].color) {
                                updateListOfPlayers = true;
                            }
                        }
                    }
                    if (updateListOfPlayers) {
                        Main.game.players = [];
                        status.players.forEach(function (playerData) {
                            var player = new CocaineCartels.Player(playerData);
                            Main.game.players.push(player);
                        });
                        _this.printStartPage();
                    }
                    else {
                        // Just update each players' ready status.
                        status.players.forEach(function (playerData) {
                            var player = Main.game.getPlayer(playerData.color);
                            player.ready = playerData.ready;
                        });
                    }
                    _this.printStartPlayersReady();
                }
            });
            window.setTimeout(function () { return _this.tick(); }, 1000);
        };
        Main.prototype.updateGameState = function () {
            return CocaineCartels.GameService.getGameState().then(function (gameState) {
                Main.game = gameState.gameInstance;
                Main.game.initializeBoard(Main.game.previousTurn);
                Main.game.initializeBoard(Main.game.previousTurnWithPlaceCommands);
                Main.game.initializeBoard(Main.game.previousTurnWithMoveCommands);
                Main.game.initializeBoard(Main.game.currentTurn);
                Main.currentPlayer = gameState.currentPlayer;
            });
        };
        return Main;
    })();
    CocaineCartels.Main = Main;
})(CocaineCartels || (CocaineCartels = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var MoveCommand = (function (_super) {
        __extends(MoveCommand, _super);
        function MoveCommand(unit, from, to) {
            _super.call(this, CocaineCartels.CommandType.MoveCommand, unit);
            this.unit = unit;
            this.from = from;
            this.to = to;
            this._color = undefined;
            if (unit.cell === null && unit.placeCommand === null) {
                throw "Can only assign move commands to units that are placed on a cell or has a place command.";
            }
        }
        Object.defineProperty(MoveCommand.prototype, "color", {
            get: function () {
                if (this._color === undefined) {
                    this._color = this.unit.player.color;
                }
                return this._color;
            },
            enumerable: true,
            configurable: true
        });
        return MoveCommand;
    })(CocaineCartels.Command);
    CocaineCartels.MoveCommand = MoveCommand;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var PlaceCommand = (function (_super) {
        __extends(PlaceCommand, _super);
        function PlaceCommand(unit, on) {
            _super.call(this, CocaineCartels.CommandType.PlaceCommand, unit);
            this.unit = unit;
            this.on = on;
        }
        return PlaceCommand;
    })(CocaineCartels.Command);
    CocaineCartels.PlaceCommand = PlaceCommand;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Player = (function () {
        function Player(playerData) {
            this.color = playerData.color;
            this.commandsSentOn = Player.parseDateString(playerData.commandsSentOn);
            this.points = playerData.points;
            this.pointsLastTurn = playerData.pointsLastTurn;
            this.name = playerData.name;
            this.ready = playerData.ready;
        }
        Object.defineProperty(Player.prototype, "numberOfMoveCommands", {
            /** Returns the number of move commands that the current has assigned. */
            get: function () {
                var _this = this;
                var numberOfMoveCommands = CocaineCartels.Main.game.currentTurn.moveCommands.filter(function (command) { return command.player.color === _this.color; }).length;
                return numberOfMoveCommands;
            },
            enumerable: true,
            configurable: true
        });
        Player.parseDateString = function (dateString) {
            if (dateString == null) {
                return null;
            }
            return new Date(dateString);
        };
        return Player;
    })();
    CocaineCartels.Player = Player;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Pos = (function () {
        function Pos(x, y) {
            this.x = x;
            this.y = y;
        }
        /** Returns the squared distance between two positions. */
        Pos.prototype.distance = function (other) {
            var squaredDistance = Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
            return squaredDistance;
        };
        /** Returns a new vector where the x and y values are multipled by a factor. */
        Pos.prototype.multiply = function (factor) {
            var multiplied = new Pos(this.x * factor, this.y * factor);
            return multiplied;
        };
        Pos.prototype.nearestHex = function (hexes) {
            var _this = this;
            var minDist = null;
            var nearestHex;
            hexes.forEach(function (hex) {
                var dist = _this.distance(hex.pos);
                if (minDist === null || dist < minDist) {
                    minDist = dist;
                    nearestHex = hex;
                }
            });
            return nearestHex;
        };
        return Pos;
    })();
    CocaineCartels.Pos = Pos;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Settings = (function () {
        function Settings() {
        }
        Settings.gridSize = serverSideSettings.GridSize;
        Settings.movesPerTurn = serverSideSettings.MovesPerTurn;
        return Settings;
    })();
    CocaineCartels.Settings = Settings;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Turn = (function () {
        /** Call initializeUnits after the board has been initialized. */
        function Turn(turnData) {
            var _this = this;
            // No units and commands initialized yet.
            this.cells = [];
            turnData.cells.forEach(function (cellData) {
                var cell = new CocaineCartels.Cell(cellData, _this);
                _this.cells.push(cell);
            });
            this.mode = turnData.mode;
            this.newUnits = [];
            turnData.newUnits.forEach(function (unitData) {
                var newUnit = new CocaineCartels.Unit(unitData, _this, null);
                _this.newUnits.push(newUnit);
            });
            this.turnNumber = turnData.turnNumber;
        }
        Object.defineProperty(Turn.prototype, "allUnits", {
            get: function () {
                var allUnits = this.unitsOnBoard.concat(this.newUnits);
                return allUnits;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Turn.prototype, "moveCommands", {
            get: function () {
                var moveCommands = this.unitsOnBoardOrToBePlacedOnBoard
                    .map(function (unit) { return unit.moveCommand; })
                    .filter(function (moveCommand) { return moveCommand !== null; });
                return moveCommands;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Turn.prototype, "unitsOnBoard", {
            /** Returns the list of units placed on the board, i.e. units to be placed on the board are not included. */
            get: function () {
                var unitsDoubleArray = this.cells.map(function (cell) { return cell.units; });
                var units = CocaineCartels.Utilities.flatten(unitsDoubleArray);
                return units;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Turn.prototype, "unitsOnBoardOrToBePlacedOnBoard", {
            get: function () {
                var unitsOnBoardOrToBePlacedOnBoard = this.unitsOnBoard.concat(this.unitsToBePlacedOnBoard);
                return unitsOnBoardOrToBePlacedOnBoard;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Turn.prototype, "unitsToBePlacedOnBoard", {
            get: function () {
                var unitsToBePlacedOnBoard = this.newUnits.filter(function (unit) { return unit.placeCommand !== null; });
                return unitsToBePlacedOnBoard;
            },
            enumerable: true,
            configurable: true
        });
        Turn.prototype.allowedCellsForMove = function (unit) {
            if (unit.cell === null && unit.placeCommand === null) {
                throw "It's not allowed to move a cell that is not on the board or to be placed on the board.";
            }
            var fromCell;
            if (unit.cell !== null) {
                fromCell = unit.cell;
            }
            else {
                fromCell = unit.placeCommand.on;
            }
            var allowedCells = this.cells.filter(function (cell) {
                var allowed = cell.distance(fromCell) <= unit.maximumMoveDistance;
                return allowed;
            });
            return allowedCells;
        };
        Turn.prototype.allowedCellsForPlace = function (unit) {
            var cellsWithUnits = this.cells.filter(function (cell) {
                var cellHasUnitsBelongingToCurrentPlayer = cell.units
                    .filter(function (u) { return u.moveCommand === null; })
                    .filter(function (u) { return u.player === unit.player; })
                    .length > 0;
                return cellHasUnitsBelongingToCurrentPlayer;
            });
            var moveFromCells = this.moveCommands
                .filter(function (mc) { return mc.unit.player === unit.player; })
                .map(function (mc) { return mc.from; });
            var allowedCells = CocaineCartels.Utilities.union(cellsWithUnits, moveFromCells);
            return allowedCells;
        };
        Turn.prototype.getCell = function (hex) {
            var cell = this.cells.filter(function (c) { return c.hex.equals(hex); })[0];
            return cell;
        };
        Turn.prototype.getMoveCommands = function (from, to) {
            var moveCommands = this.moveCommands.filter(function (moveCommand) { return moveCommand.from === from && moveCommand.to === to; });
            return moveCommands;
        };
        Turn.prototype.nearestCell = function (pos) {
            var minDist = null;
            var nearestCell;
            this.cells.forEach(function (cell) {
                var dist = cell.hex.pos.distance(pos);
                if (dist < minDist || minDist === null) {
                    minDist = dist;
                    nearestCell = cell;
                }
            });
            return nearestCell;
        };
        Turn.prototype.newUnitsForPlayer = function (player) {
            var newUnits = this.newUnits.filter(function (u) { return u.player.color === player.color; });
            return newUnits;
        };
        Turn.prototype.placeUnit = function (unit, on) {
            if (unit.cell !== null) {
                throw "The unit is already placed on a cell.";
            }
            on.addUnit(unit);
        };
        return Turn;
    })();
    CocaineCartels.Turn = Turn;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Unit = (function () {
        /** Set cell to null if this is a new unit. */
        function Unit(unitData, board, cell) {
            this._placeCommand = undefined;
            this._player = undefined;
            this._moveCommand = undefined;
            this._unitData = unitData;
            this.board = board;
            this.cell = cell;
            this.circle = null;
            this._color = unitData.player.color;
            this._movedColor = tinycolor(unitData.player.color).lighten(35).toString("hex6");
        }
        Object.defineProperty(Unit.prototype, "color", {
            /** The color of the unit. Based on the color of the player who onws the unit. */
            get: function () {
                return this._color;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Unit.prototype, "maximumMoveDistance", {
            get: function () {
                return 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Unit.prototype, "moveCommand", {
            get: function () {
                if (this._moveCommand === undefined) {
                    if (this._unitData.moveCommand === null) {
                        this.moveCommand = null;
                    }
                    else {
                        var from = this.board.getCell(this._unitData.moveCommand.fromHex);
                        var to = this.board.getCell(this._unitData.moveCommand.toHex);
                        this.setMoveCommand(from, to);
                    }
                }
                return this._moveCommand;
            },
            set: function (newMoveCommand) {
                if (newMoveCommand === null) {
                    this._moveCommand = null;
                    return;
                }
                if (this.cell === null && this.placeCommand === null) {
                    throw "Can only assign a move command to a unit that is positioned on a cell or has a place command.";
                }
                this._moveCommand = newMoveCommand;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Unit.prototype, "placedColor", {
            get: function () {
                return this._movedColor;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Unit.prototype, "placeCommand", {
            get: function () {
                if (this._placeCommand === undefined) {
                    if (this._unitData.placeCommand === null) {
                        this.placeCommand = null;
                    }
                    else {
                        var on = this.board.getCell(this._unitData.placeCommand.onHex);
                        this.setPlaceCommand(on);
                    }
                }
                return this._placeCommand;
            },
            set: function (newPlaceCommand) {
                if (newPlaceCommand === null) {
                    this._placeCommand = null;
                    return;
                }
                // This has been removed for now to allow new units to be highlighted on the second board.
                //if (this.cell !== null) {
                //    throw "Cannot assign a place command to a unit that already is placed on a cell.";
                //}
                this._placeCommand = newPlaceCommand;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Unit.prototype, "player", {
            get: function () {
                if (this._player === undefined) {
                    this._player = CocaineCartels.Main.game.getPlayer(this._unitData.player.color);
                }
                return this._player;
            },
            enumerable: true,
            configurable: true
        });
        Unit.prototype.deleteUnit = function () {
            this.cell = null;
            this._moveCommand = null;
            this._placeCommand = null;
            this._player = null;
        };
        Unit.prototype.setMoveCommand = function (from, to) {
            if (from === to) {
                this.moveCommand = null;
            }
            else {
                this.moveCommand = new CocaineCartels.MoveCommand(this, from, to);
            }
        };
        Unit.prototype.setPlaceCommand = function (on) {
            this.placeCommand = new CocaineCartels.PlaceCommand(this, on);
        };
        return Unit;
    })();
    CocaineCartels.Unit = Unit;
})(CocaineCartels || (CocaineCartels = {}));
var CocaineCartels;
(function (CocaineCartels) {
    "use strict";
    var Utilities = (function () {
        function Utilities() {
        }
        Utilities.flatten = function (doubleArray) {
            var flattened = Array.prototype.concat.apply([], doubleArray);
            return flattened;
        };
        Utilities.getUrlParameters = function () {
            var pl = /\+/g; // Regex for replacing addition symbol with a space
            var search = /([^&=]+)=?([^&]*)/g;
            var decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); };
            var query = window.location.search.substring(1);
            var parameters = {};
            var match;
            while ((match = search.exec(query))) {
                parameters[decode(match[1])] = decode(match[2]);
            }
            return parameters;
        };
        /** Groups elements in array by a key generated by groupByFunc. (You can use JSON.stingify to in the groupByFunc to convert any object in to a string. */
        Utilities.groupBy = function (array, groupByFunc) {
            var associativeArray = {};
            array.forEach(function (item) {
                var key = groupByFunc(item);
                if (associativeArray[key] === undefined) {
                    associativeArray[key] = [];
                }
                associativeArray[key].push(item);
            });
            return associativeArray;
        };
        Utilities.groupByIntoArray = function (array, groupByFunc) {
            var associativeArray = Utilities.groupBy(array, groupByFunc);
            var doubleArray = Utilities.toDoubleArray(associativeArray);
            return doubleArray;
        };
        /** Returns the points halfway between a and b. */
        Utilities.midPoint = function (a, b) {
            var mid = new CocaineCartels.Pos((a.x + b.x) / 2, (a.y + b.y) / 2);
            return mid;
        };
        /** Treats a position as a 2D vector with (0,0) as origin and returns a new vector that is rotated 90 degrees counter clockwize. */
        Utilities.rotate90Degrees = function (vector) {
            var rotated = new CocaineCartels.Pos(-vector.y, vector.x);
            return rotated;
        };
        /** Converts an associative array to a double array. They keys are deleted in the process. */
        Utilities.toDoubleArray = function (associativeArray) {
            var doubleArray = Object.keys(associativeArray).map(function (group) {
                return associativeArray[group];
            });
            return doubleArray;
        };
        /** Returns a union of two arrays of the same type that does not contain any duplicate items. */
        Utilities.union = function (array1, array2) {
            var union = [];
            array1.forEach(function (item) {
                if (union.filter(function (i) { return i === item; }).length === 0) {
                    union.push(item);
                }
            });
            array2.forEach(function (item) {
                if (union.filter(function (i) { return i === item; }).length === 0) {
                    union.push(item);
                }
            });
            return union;
        };
        return Utilities;
    })();
    CocaineCartels.Utilities = Utilities;
})(CocaineCartels || (CocaineCartels = {}));
//# sourceMappingURL=combined.js.map