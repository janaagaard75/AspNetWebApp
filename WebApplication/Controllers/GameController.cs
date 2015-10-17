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

        [HttpGet, Route("api/game")]
        public Game GetGame()
        {
            return GameInstance;
        }

        private static Game GameInstance; // TODO: Does this need to static?
    }
}
