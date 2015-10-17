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
            GameInstance = Game.Instance;
        }

        private static Game GameInstance; // TODO: Does this need to static?

        public void GetPlayerColor()
        {
            Debug.Assert(HttpContext.Current.Request.UserHostAddress != null, "HttpContext.Current.Request.UserHostAddress != null");

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;

            Player player = GameInstance.AddOrGetPlayer(ipAddress, userAgent);
            Clients.Caller.setPlayerColor(player.Color); // TODO: Should return the color instead.
            Clients.All.playerJoined(player.Color);
        }

        public Game GetGame()
        {
            return GameInstance;
        }
    }
}
