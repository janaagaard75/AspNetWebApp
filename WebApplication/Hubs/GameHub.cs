using System;
using System.Net;
using System.Web;
using CocaineCartels.BusinessLogic;
using Microsoft.AspNet.SignalR;

namespace CocaineCartels.WebApplication.Hubs
{
    public class GameHub : Hub
    {
        public GameHub()
        {
            GameInstance = Game.Instance;
        }

        private static Game GameInstance; // TODO: Does this need to be static?

        public string GetPlayerColor()
        {
            if (HttpContext.Current.Request.UserHostAddress == null)
            {
                throw new ApplicationException("HttpContext.Current.Request.UserHostAddress is null.");
            }

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;

            Player player = GameInstance.GetPlayer(ipAddress, userAgent);
            Clients.All.playerJoined(player.Color);

            return player.Color;
        }

        public Game GetGame()
        {
            return GameInstance;
        }
    }
}
