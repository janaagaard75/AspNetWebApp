module Muep {
    "use strict";

    class ConnectionState {
        public static connected = 0;
        public static connecting = 1;
        public static disconnected = 2;
        public static reconnecting = 3;
    }

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

        private getConnectedServer(): JQueryPromise<IGameServer> {
            switch (this.proxy.connection.state) {
                case ConnectionState.connected:
                    const deferred = $.Deferred<IGameServer>();
                    deferred.resolve(this.proxy.server);
                    return deferred.promise();

                case ConnectionState.connecting:
                    throw "Don't know how to handle the 'connecting' state.";

                case ConnectionState.disconnected:
                    return this.proxy.connection.start(() => {
                        console.info("Establishing SignalR connection.");
                    }).then(() => {
                        console.info("SignalR connection established.");
                        return this.proxy.server;
                    });

                case ConnectionState.reconnecting:
                    throw "Don't know how to handle the 'reconnecting' state.";
            }
        }

        public getGameState(): JQueryPromise<IGame> {
            return this.getConnectedServer().then(server => {
                return server.getGame();
            });
        }

        public getPlayerColor2(): JQueryPromise<string> {
            return this.getConnectedServer().then(server => {
                return server.getPlayerColor();
            }).then(color => {
                console.info(`Player color is ${color}.`);
                return color;
            });
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
