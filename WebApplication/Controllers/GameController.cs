using System;
using System.Net;
using System.Web;
using System.Web.Http;
using CocaineCartels.BusinessLogic;
using CocaineCartels.WebApplication.Models;

namespace CocaineCartels.WebApplication.Controllers
{
    public class GameController : ApiController
    {
        public GameController()
        {
            // TODO j: Is there any idea in having this local instance variable?
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

        [HttpPost, Route("api/commands")]
        public void PostCommands(PlayerCommands commands)
        {
            // TODO j: Loop through the place and then the move commands, adding them to the game.
        }
    }
}
