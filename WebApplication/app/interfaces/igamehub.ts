module Muep {
    "use strict";

    export interface IGameHub extends HubProxy {
        client: IGameClient;
        server: IGameServer;
    }
}
