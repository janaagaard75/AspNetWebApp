using System;
using System.Net;
using System.Web;
using System.Web.Http;
using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Controllers
{
    public class GameController : ApiController
    {
        public GameController()
        {
            GameInstance = Game.Instance;
        }

        private readonly Game GameInstance;

        [HttpGet, Route("api/currentplayercolor")]
        public string GetCurrentPlayerColor()
        {
            if (HttpContext.Current.Request.UserHostAddress == null)
            {
                throw new ApplicationException("HttpContext.Current.Request.UserHostAddress is null.");
            }

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;

            Player currentPlayer = GameInstance.GetPlayer(ipAddress, userAgent);
            return currentPlayer.Color;
        }

        [HttpGet, Route("api/gamestate")]
        public Game GetGameState()
        {
            return GameInstance;
        }
    }
}
