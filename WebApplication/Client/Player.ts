module CocaineCartels {
    "use strict";

    export class Player {
        constructor(
            playerData: IPlayer
        ) {
            this.color = playerData.color;
            this.commandsSentOn = Player.parseDateString(playerData.commandsSentOn);
            this.points = playerData.points;
            this.pointsLastTurn = playerData.pointsLastTurn;
            this.ready = playerData.ready;
            this.textColor = playerData.textColor;
        }

        public color: string;
        public commandsSentOn: Date;
        public points: number;
        public pointsLastTurn: number;
        public ready: boolean;
        public textColor: string;

        /** Returns the number of move commands that the current has assigned. */
        public get numberOfMoveCommands(): number {
            const numberOfMoveCommands = Main.game.currentTurn.moveCommands.filter(command => command.player.color === this.color).length;
            return numberOfMoveCommands;
        }

        private static parseDateString(dateString: string): Date {
            if (dateString == null) {
                return null;
            }

            return new Date(dateString);
        }
    }
}
