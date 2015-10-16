using System.Web.Mvc;
using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Controllers
{
    public class HomeController : Controller
    {
        private static Game Game;

        public HomeController()
        {
            Game = new Game();
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Chat()
        {
            return View();
        }
    }
}
