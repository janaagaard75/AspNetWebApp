module CocaineCartels {
    "use strict";

    export class Player {
        constructor(
            playerData: IPlayer
        ) {
            this.administrator = playerData.administrator;
            this.color = playerData.color;
            this.points = playerData.points;
            this.ready = playerData.ready;
        }

        public administrator: boolean;
        public color: string;
        public points: number;
        public ready: boolean;

        /** Returns the number of move commands that the current has assigned. */
        public get numberOfMoveCommands(): number {
            const numberOfMoveCommands = Main.game.currentTurn.moveCommands.filter(command => command.player.color === this.color).length;
            return numberOfMoveCommands;
        }
    }
}
