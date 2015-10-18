module Muep {
    "use strict";

    const connected = 0;
    const conncting = 1;
    const disconnected = 2;
    const reconnecting = 3;

    export class GameHub {
        constructor() {
            this.proxy = <IGameHub>$.connection.hub.proxies.gamehub;
            //this.proxy.connection.start(() => {
            //    console.info("Establishing SignalR connection.");
            //}).done(() => {
            //    console.info("SignalR connection established.");
            //});
        }

        private proxy: IGameHub;

        private estalishConnection() {
            
        }

        public getGameState(): IGame {
            if (this.proxy.connection.state !== connected) {
                throw "SignalR connection has not been established.";
            }

            const instance = this.proxy.server.getGame();
            return instance;
        }

        public getPlayerColor(): JQueryPromise<string> {
            return this.proxy.connection.start(() => {
                console.info("Establishing SignalR connection.");
            }).then(() => {
                console.info("SignalR connection established.");
                return this.proxy.server.getPlayerColor().then(color => {
                    console.info(`Player color is ${color}.`);
                    return color;
                });
            });
        }
    }
}
