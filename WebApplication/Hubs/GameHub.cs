using System.Diagnostics;
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
            Game = Game.Instance;
        }

        private static Game Game;

        public void GetPlayerColor()
        {
            Debug.Assert(HttpContext.Current.Request.UserHostAddress != null, "HttpContext.Current.Request.UserHostAddress != null");

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;

            Player player = Game.AddOrGetPlayer(ipAddress, userAgent);
            Clients.Caller.setPlayerColor(player.Color);
            Clients.All.playerJoined(player.Color);
        }
    }
}
