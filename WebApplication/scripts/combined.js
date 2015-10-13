var Muep;
(function (Muep) {
    "use strict";
    class Canvas {
        constructor(game) {
            Canvas.game = game;
            this.drawGame();
        }
        addLayers() {
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
        drawBoard() {
            const background = new Konva.Rect({
                x: 0,
                y: 0,
                width: Muep.Settings.width,
                height: Muep.Settings.height,
                fill: "#fff"
            });
            this.backgroundLayer.add(background);
            Canvas.game.cells.forEach(cell => {
                this.drawCell(cell);
            });
        }
        drawCell(cell) {
            const hexagon = new Konva.RegularPolygon({
                x: cell.hex.pos.x,
                y: cell.hex.pos.y,
                radius: Muep.Settings.cellRadius,
                sides: 6,
                stroke: "#ccc",
                strokeWidth: Muep.Settings.lineWidth
            });
            cell.hexagon = hexagon;
            hexagon.on(Muep.HexagonEvent.dragEnter, e => {
                //console.info(`Drag entered cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = true;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });
            hexagon.on(Muep.HexagonEvent.dragLeave, e => {
                //console.info(`Drag left cell (${cell.hex.r},${cell.hex.s},${cell.hex.t}).`);
                cell.hovered = false;
                this.updateCellColor(cell);
                this.boardLayer.draw();
            });
            this.boardLayer.add(hexagon);
        }
        drawCommands() {
            var groupByFrom = command => {
                return command.from.hex;
            };
            Canvas.game.cells.forEach(cell => {
                var groups = Muep.Utilities.groupBy(cell.moveCommands, groupByFrom);
                groups.forEach(commands => {
                    commands.forEach((command, index) => {
                        this.drawMoveCommand(command, index, commands.length);
                    });
                });
            });
        }
        /** Currently redraws the game from scratch each time, re-adding all units and commands. */
        drawGame() {
            this.stage = new Konva.Stage({
                container: Muep.Settings.canvasId,
                height: Muep.Settings.height,
                width: Muep.Settings.width
            });
            this.addLayers();
            this.drawBoard();
            this.drawUnits();
            this.drawCommands();
            this.stage.draw();
        }
        drawMoveCommand(command, index, numberOfCommands) {
            const midway = Muep.Utilities.midPoint(command.from.hex.pos, command.to.hex.pos);
            const from = Muep.Utilities.midPoint(command.from.hex.pos, midway);
            const to = Muep.Utilities.midPoint(command.to.hex.pos, midway);
            const d = new Muep.Pos(to.x - from.x, to.y - from.y);
            const offset = Muep.Utilities.rotate90Degrees(d).multiply(1 / numberOfCommands);
            const origin = new Muep.Pos((numberOfCommands - 1) * offset.x / 2 - index * offset.x, (numberOfCommands - 1) * offset.y / 2 - index * offset.y);
            const arrow = new Konva["Arrow"]({
                fill: command.unit.commandColor,
                listening: false,
                pointerLength: Muep.Settings.arrowPointerLength,
                pointerWidth: Muep.Settings.arrowPointerWidth,
                points: [from.x, from.y, to.x, to.y],
                shadowBlur: Muep.Settings.arrowShadowBlurRadius,
                shadowColor: "#000",
                stroke: command.unit.commandColor,
                strokeWidth: Muep.Settings.arrowWidth,
                x: origin.x,
                y: origin.y
            });
            this.commandsLayer.add(arrow);
        }
        drawPlaceCommand(command) {
            throw "drawPlaceCommand() is not yet implemented.";
        }
        drawUnit(unit, unitIndex, numberOfUnits) {
            const distanceBetweenUnits = Muep.Settings.cellRadius / numberOfUnits;
            const x = unit.cell.hex.pos.x - (numberOfUnits - 1) * distanceBetweenUnits / 2 + unitIndex * distanceBetweenUnits;
            const circle = new Konva.Circle({
                draggable: true,
                fill: unit.color,
                radius: Muep.Settings.unitRadius,
                stroke: "#888",
                strokeWidth: Muep.Settings.lineWidth,
                x: x,
                y: unit.cell.hex.pos.y
            });
            /** Currently hovered hexagon. */
            var currentHexagon = null;
            /** Previously hovered hexagon.*/
            var previousHexagon = null;
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
                    const currentCell = Canvas.game.nearestCell(new Muep.Pos(currentHexagon.x(), currentHexagon.y()));
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
                    previousHexagon.fire(Muep.HexagonEvent.dragLeave);
                }
                else {
                    if (previousHexagon === null) {
                        // Only current defined: Moving into a cell.
                        currentHexagon.fire(Muep.HexagonEvent.dragEnter);
                    }
                    else {
                        // Both cells defined and different: Moving from one cell to another.
                        previousHexagon.fire(Muep.HexagonEvent.dragLeave);
                        currentHexagon.fire(Muep.HexagonEvent.dragEnter);
                    }
                }
                previousHexagon = currentHexagon;
            });
            circle.on("dragend", e => {
                e.target.moveTo(this.unitsLayer);
                if (currentHexagon !== null) {
                    const from = unit.cell;
                    const event = e.evt;
                    const pos = new Muep.Pos(event.layerX, event.layerY);
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
            });
            this.unitsLayer.add(circle);
        }
        drawUnits() {
            Canvas.game.cells.forEach(cell => {
                this.drawUnitsInCell(cell);
            });
        }
        drawUnitsInCell(cell) {
            cell.units.forEach((unit, index) => {
                this.drawUnit(unit, index, cell.units.length);
            });
        }
        updateCellColor(cell) {
            var backgroundColor;
            if (cell.hovered) {
                if (cell.dropAllowed) {
                    backgroundColor = "#ddd";
                }
                else {
                    // This should not happen.
                    backgroundColor = "#f99";
                }
            }
            else {
                if (cell.dropAllowed) {
                    backgroundColor = "#eee";
                }
                else {
                    backgroundColor = null;
                }
            }
            cell.hexagon.fill(backgroundColor);
        }
    }
    Muep.Canvas = Canvas;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Cell {
        constructor(hex) {
            this.hex = hex;
            // Should either merge hovered and dropAllowed into an enum or make the hovering highlight elsewhere, so that both are possible.
            this.dropAllowed = false;
            this.hovered = false;
            this.units = [];
        }
        addUnit(unit) {
            if (this.units.filter(u => u === unit).length > 0) {
                throw "The unit is already on the cell.";
            }
            this.units.push(unit);
            unit.cell = this;
        }
        /** Returns the Manhatten distance between this cell and another cell. See http://www.redblobgames.com/grids/hexagons/#distances */
        distance(other) {
            const distance = Math.max(Math.abs(this.hex.r - other.hex.r), Math.abs(this.hex.s - other.hex.s), Math.abs(this.hex.t - other.hex.t));
            return distance;
        }
        get moveCommands() {
            const moveCommands = this.units
                .map(unit => unit.command)
                .filter(command => command !== null && command.type === Muep.CommandType.MoveCommand)
                .map(moveCommand => moveCommand);
            return moveCommands;
        }
        removeUnit(unit) {
            const unitsToRemove = this.units.filter(u => u === unit);
            unitsToRemove.forEach(u => {
                u.cell = null;
            });
            this.units = this.units.filter(u => u !== unit);
        }
    }
    Muep.Cell = Cell;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    (function (CommandType) {
        CommandType[CommandType["MoveCommand"] = 0] = "MoveCommand";
        CommandType[CommandType["PlaceCommand"] = 1] = "PlaceCommand";
    })(Muep.CommandType || (Muep.CommandType = {}));
    var CommandType = Muep.CommandType;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Command {
        constructor(type, unit) {
            this.type = type;
            this.unit = unit;
            unit.command = this;
        }
    }
    Muep.Command = Command;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Game {
        constructor() {
            this.gridSize = 3;
            this.playerColors = ["#f00", "#0f0", "#00f"];
            this.initalizeGame();
        }
        allowedCellsForMove(unit) {
            if (unit.cell == null) {
                return [];
            }
            const allowedCells = this.cells.filter(cell => {
                const distance = cell.distance(unit.cell);
                return (distance > 0 && distance <= unit.maximumMoveDistance);
            });
            return allowedCells;
        }
        allowedCellsForPlace(unit) {
            throw "allowedCellsForPlace is not yet implemented.";
        }
        get commands() {
            const commands = this.units.map(unit => unit.command).filter(command => command !== null);
            return commands;
        }
        static flatten(doubleArray) {
            const flattened = Array.prototype.concat.apply([], doubleArray);
            return flattened;
        }
        getCell(hex) {
            const cell = this.cells.filter(c => { return c.hex.equals(hex); })[0];
            return cell;
        }
        initalizeGame() {
            this.cells = [];
            for (let r = -this.gridSize; r <= this.gridSize; r++) {
                for (let s = -this.gridSize; s <= this.gridSize; s++) {
                    // Satisfy r+s+t=0.
                    const t = -r - s;
                    // t cannot exceed gridSize.
                    if (t < -this.gridSize || t > this.gridSize) {
                        continue;
                    }
                    const hex = new Muep.Hex(r, s, t);
                    const cell = new Muep.Cell(hex);
                    this.cells.push(cell);
                }
            }
            const redPlayer = new Muep.Player("#f00");
            const yellowPlayer = new Muep.Player("#ff0");
            const greenPlayer = new Muep.Player("#0f0");
            const cyanPlayer = new Muep.Player("#0ff");
            const bluePlayer = new Muep.Player("#00f");
            const magentaPlayer = new Muep.Player("#f0f");
            this.players = [redPlayer, yellowPlayer, greenPlayer, cyanPlayer, bluePlayer];
            this.getCell(new Muep.Hex(3, 0, -3)).addUnit(new Muep.Unit(redPlayer));
            this.getCell(new Muep.Hex(3, -3, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(0, -3, 3)).addUnit(new Muep.Unit(greenPlayer));
            this.getCell(new Muep.Hex(-3, 0, 3)).addUnit(new Muep.Unit(cyanPlayer));
            this.getCell(new Muep.Hex(-3, 3, 0)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(0, 3, -3)).addUnit(new Muep.Unit(magentaPlayer));
            this.getCell(new Muep.Hex(0, 0, 0)).addUnit(new Muep.Unit(redPlayer));
            this.getCell(new Muep.Hex(0, 0, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(0, 0, 0)).addUnit(new Muep.Unit(greenPlayer));
            this.getCell(new Muep.Hex(0, -1, 1)).addUnit(new Muep.Unit(greenPlayer));
            this.getCell(new Muep.Hex(0, -1, 1)).addUnit(new Muep.Unit(greenPlayer));
            this.getCell(new Muep.Hex(-1, 0, 1)).addUnit(new Muep.Unit(cyanPlayer));
            this.getCell(new Muep.Hex(-1, 0, 1)).addUnit(new Muep.Unit(cyanPlayer));
            this.getCell(new Muep.Hex(-1, 0, 1)).addUnit(new Muep.Unit(cyanPlayer));
            this.getCell(new Muep.Hex(-1, 1, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(-1, 1, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(-1, 1, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(-1, 1, 0)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(0, 1, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(0, 1, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(0, 1, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(0, 1, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(0, 1, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(redPlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(yellowPlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(greenPlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(cyanPlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(bluePlayer));
            this.getCell(new Muep.Hex(1, 0, -1)).addUnit(new Muep.Unit(magentaPlayer));
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
                const cyanUnit = new Muep.Unit(cyanPlayer);
                this.getCell(new Muep.Hex(2, -2, 0)).addUnit(cyanUnit);
                cyanUnit.setMoveCommand(this.getCell(new Muep.Hex(2 + r, -2 + s, 0 + t)), this.getCell(new Muep.Hex(2, -2, 0)));
            }
            for (let i = 0; i < 4; i++) {
                let from;
                if (i < 2) {
                    from = new Muep.Hex(0, 2, -2);
                }
                else {
                    from = new Muep.Hex(1, 2, -3);
                }
                const magentaUnit = new Muep.Unit(magentaPlayer);
                this.getCell(new Muep.Hex(1, 1, -2)).addUnit(magentaUnit);
                magentaUnit.setMoveCommand(this.getCell(from), this.getCell(new Muep.Hex(1, 1, -2)));
            }
            for (let i = 2; i <= 6; i++) {
                let to;
                switch (i) {
                    case 2:
                        to = new Muep.Hex(-2, 0, 2);
                        break;
                    case 3:
                        to = new Muep.Hex(-2, -1, 3);
                        break;
                    case 4:
                        to = new Muep.Hex(-1, -1, 2);
                        break;
                    case 5:
                        to = new Muep.Hex(-1, -2, 3);
                        break;
                    case 6:
                        to = new Muep.Hex(0, -2, 2);
                        break;
                }
                let from = new Muep.Hex(to.r + 1, to.s - 1, to.t);
                for (let j = 0; j < i; j++) {
                    const greenUnit = new Muep.Unit(greenPlayer);
                    this.getCell(to).addUnit(greenUnit);
                    greenUnit.setMoveCommand(this.getCell(from), this.getCell(to));
                }
            }
        }
        /** Moves a unit to the specified cell. Also sets the command to null. */
        moveUnit(unit, newCell) {
            unit.cell.removeUnit(unit);
            newCell.addUnit(unit);
            unit.command = null;
        }
        nearestCell(pos) {
            const nearestCell = Game.nearestCell(pos, this.cells);
            return nearestCell;
        }
        static nearestCell(pos, cells) {
            var minDist = null;
            var nearestCell;
            cells.forEach(cell => {
                var dist = cell.hex.pos.distance(pos);
                if (dist < minDist || minDist === null) {
                    minDist = dist;
                    nearestCell = cell;
                }
            });
            return nearestCell;
        }
        get units() {
            const unitsDoubleArray = this.cells.map(cell => cell.units);
            const units = Game.flatten(unitsDoubleArray);
            return units;
        }
    }
    Muep.Game = Game;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    /** Hexagon coordinates with r, s and t. */
    class Hex {
        constructor(r, s, t) {
            this.r = r;
            this.s = s;
            this.t = t;
            const sum = r + s + t;
            if (sum !== 0) {
                throw `r + s + t must be equal to 0. The sum of (${r}, ${s}, ${t}) is ${sum}.`;
            }
            this.pos = Hex.hexToPos(this);
        }
        equals(other) {
            const equals = (this.r === other.r && this.s === other.s && this.t === other.t);
            return equals;
        }
        static hexToPos(hex) {
            const center = {
                x: Muep.Settings.width / 2,
                y: Muep.Settings.height / 2
            };
            const x = center.x + Math.sqrt(3) * Muep.Settings.cellRadius * hex.r + Math.sqrt(3) / 2 * Muep.Settings.cellRadius * hex.t;
            const y = center.y + 1.5 * Muep.Settings.cellRadius * hex.t;
            const pos = new Muep.Pos(x, y);
            return pos;
        }
    }
    Muep.Hex = Hex;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class HexagonEvent {
    }
    HexagonEvent.dragEnter = "dragenter";
    HexagonEvent.dragLeave = "dragleave";
    Muep.HexagonEvent = HexagonEvent;
})(Muep || (Muep = {}));
/// <reference path="scripts/typings/konva/konva.d.ts" />
/// <reference path="scripts/typings/tinycolor/tinycolor.d.ts" />
/// <reference path="../../_references.ts"/>
var Muep;
(function (Muep) {
    "use strict";
})(Muep || (Muep = {}));
/// <reference path="../../_references.ts"/>
var Muep;
(function (Muep) {
    "use strict";
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Main {
        constructor() {
            this.setCanvasSize();
            Muep.Settings.initialize();
            Main.game = new Muep.Game();
            Main.canvas = new Muep.Canvas(Main.game);
        }
        setCanvasSize() {
            const minSize = Math.min(window.innerWidth, window.innerHeight);
            const canvasSize = `${minSize}px`;
            const canvasElement = document.getElementById(Muep.Settings.canvasId);
            canvasElement.style.width = canvasSize;
            canvasElement.style.height = canvasSize;
        }
    }
    Muep.Main = Main;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    // TODO: A move command should only have a from cell, since the unit is located in the to cell.
    class MoveCommand extends Muep.Command {
        constructor(unit, from, to) {
            super(Muep.CommandType.MoveCommand, unit);
            this.unit = unit;
            this.from = from;
            this.to = to;
        }
    }
    Muep.MoveCommand = MoveCommand;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class PlaceCommand extends Muep.Command {
        constructor(unit, cell) {
            super(Muep.CommandType.PlaceCommand, unit);
            this.unit = unit;
            this.cell = cell;
        }
    }
    Muep.PlaceCommand = PlaceCommand;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Player {
        constructor(color) {
            this.color = color;
            this.units = [];
        }
    }
    Muep.Player = Player;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Pos {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        /** Returns the squared distance between two positions. */
        distance(other) {
            const squaredDistance = Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2);
            return squaredDistance;
        }
        /** Returns a new vector where the x and y values are multipled by a factor. */
        multiply(factor) {
            const multiplied = new Pos(this.x * factor, this.y * factor);
            return multiplied;
        }
        nearestHex(hexes) {
            var minDist = null;
            var nearestHex;
            hexes.forEach(hex => {
                var dist = this.distance(hex.pos);
                if (minDist === null || dist < minDist) {
                    minDist = dist;
                    nearestHex = hex;
                }
            });
            return nearestHex;
        }
    }
    Muep.Pos = Pos;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Settings {
        static initialize() {
            const canvasElement = document.getElementById(Settings.canvasId);
            this.height = canvasElement.clientHeight;
            this.width = canvasElement.clientWidth;
            this.cellRadius = this.height / 12.5;
            this.lineWidth = 1 + this.height / 1000;
            this.arrowWidth = 2 * this.lineWidth;
            this.unitRadius = this.cellRadius / 2.2;
        }
    }
    Settings.arrowPointerLength = 4;
    Settings.arrowPointerWidth = 5;
    Settings.arrowShadowBlurRadius = 10;
    Settings.canvasId = "canvas";
    Muep.Settings = Settings;
})(Muep || (Muep = {}));
var Muep;
(function (Muep) {
    "use strict";
    class Unit {
        constructor(player) {
            this.player = player;
            this.cell = null;
            this.command = null;
            this._color = tinycolor(this.player.color).lighten(0).toString("hex6");
        }
        get color() {
            return this._color;
        }
        get commandColor() {
            return this.player.color;
        }
        get maximumMoveDistance() {
            return 1;
        }
        setMoveCommand(from, to) {
            const moveCommand = new Muep.MoveCommand(this, from, to);
            this.command = moveCommand;
            return moveCommand;
        }
    }
    Muep.Unit = Unit;
})(Muep || (Muep = {}));
/// <reference path="../_references.ts"/>
var Muep;
(function (Muep) {
    "use strict";
    class Utilities {
        static groupBy(array, groupByFunc) {
            var associativeArray = {};
            array.forEach(item => {
                var group = JSON.stringify(groupByFunc(item));
                if (associativeArray[group] === undefined) {
                    associativeArray[group] = [];
                }
                associativeArray[group].push(item);
            });
            const doubleArray = Object.keys(associativeArray).map(group => {
                return associativeArray[group];
            });
            return doubleArray;
        }
        /** Returns the points halfway between a and b. */
        static midPoint(a, b) {
            const mid = new Muep.Pos((a.x + b.x) / 2, (a.y + b.y) / 2);
            return mid;
        }
        static rotate90Degrees(vector) {
            const rotated = new Muep.Pos(-vector.y, vector.x);
            return rotated;
        }
    }
    Muep.Utilities = Utilities;
})(Muep || (Muep = {}));
//# sourceMappingURL=combined.js.map