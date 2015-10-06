module Muep {
    "use strict";

    export class Canvas {
        constructor(
            game: Game
        ) {
            Canvas.game = game;

            this.stage = new Konva.Stage({
                container: "canvas",
                height: Constants.height,
                width: Constants.width
            });

            this.drawGame();
        }

        private static game: Game; // Has be to static to be accessible inside unitDragBound
        private stage: Konva.Stage;

        private drawBoard() {
            const boardLayer = new Konva.Layer();
            const background = new Konva.Rect({
                x: 0,
                y: 0,
                width: Constants.width,
                height: Constants.height,
                fill: "#fff"
            });
            boardLayer.add(background);

            Canvas.game.cells.forEach(cell => {
                this.drawCell(boardLayer, cell);
            });

            this.stage.add(boardLayer);
        }

        private drawCell(boardLayer: Konva.Layer, cell: Cell) {
            const hexagon = new Konva.RegularPolygon({
                x: cell.hex.pos.x,
                y: cell.hex.pos.y,
                radius: Constants.cellRadius,
                sides: 6,
                stroke: "#ccc",
                strokeWidth: 1
            });
            boardLayer.add(hexagon);
        }

        private drawCommand(commandsLayer: Konva.Layer, command: Command) {
            switch (command.type) {
                case CommandType.MoveCommand:
                    this.drawMoveCommand(commandsLayer, <MoveCommand>command);
                    break;

                case CommandType.PlaceCommand:
                    this.drawPlaceCommand(commandsLayer, <PlaceCommand>command);
                    break;

                default:
                    throw `The command type ${command.type} is not supported.`;
            }
        }

        private drawCommands() {
            const commandsLayer = new Konva.Layer();

            Canvas.game.commands.forEach(command => {
                this.drawCommand(commandsLayer, command);
            });

            this.stage.add(commandsLayer);
        }

        public drawGame() {
            this.drawBoard();
            this.drawUnits();
            this.drawCommands();
        }

        private drawMoveCommand(commandsLayer: Konva.Layer, command: MoveCommand) {
            const arrow = new Konva["Arrow"]({
                listening: false,
                pointerLength: 4,
                pointerWidth: 5,
                points: [command.from.hex.pos.x, command.from.hex.pos.y, command.to.hex.pos.x, command.to.hex.pos.y],
                stroke: command.unit.commandColor,
                strokeWidth: 2,
                x: 0,
                y: 0
            });

            commandsLayer.add(arrow);
        }

        private drawPlaceCommand(commandsLayer: Konva.Layer, command: PlaceCommand) {
            throw "drawPlaceCommand() is not yet done.";
        }

        private drawUnit(unitsLayer: Konva.Layer, unit: Unit) {
            const circleRadius = Constants.cellRadius / 1.8;
            const circle = new Konva.Circle({
                dragBoundFunc: this.maxDistDragBoundFunc(unit.cell, 1),
                draggable: true,
                fill: unit.color,
                radius: circleRadius,
                x: unit.cell.hex.pos.x,
                y: unit.cell.hex.pos.y
            });

            circle.on("dragend unit", e => {
                const from = unit.cell;
                const event = <MouseEvent>e.evt;
                const pos = new Pos(event.layerX, event.layerY);
                const to = Canvas.game.nearestCell(pos);

                console.info(`Dragged ${unit.color} unit from (${from.hex.r},${from.hex.s},${from.hex.t}) to (${to.hex.r},${to.hex.s},${to.hex.t}).`);

                if (from === to) {
                    return;
                }

                Canvas.game.moveUnit(unit, to);
            });

            unitsLayer.add(circle);
        }

        private drawUnits() {
            const unitsLayer = new Konva.Layer();

            Canvas.game.units.forEach(unit => {
                this.drawUnit(unitsLayer, unit);
            });

            this.stage.add(unitsLayer);
        }

        private maxDistDragBoundFunc(origin: Cell, maximumDistance: number): IDragBoundFunc {
            const func = (pos: IPos) => {
                var nearestCell = Canvas.game.nearestAllowedCell(pos, origin, maximumDistance);
                return nearestCell.hex.pos;
            }

            return func;
        }
    }
}
