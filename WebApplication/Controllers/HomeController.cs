using System;
using System.Web;
using System.Web.Mvc;

namespace CocaineCartels.WebApplication.Controllers
{
    public class HomeController : Controller
    {
        internal const string IdentifierCookieName = "CocaineCartelsId";

        public ActionResult Index()
        {
            // If this player doesn't have an identifier cookie add one.
            if (Request.Cookies[IdentifierCookieName] == null)
            {
                HttpCookie identifierCookie = new HttpCookie(IdentifierCookieName);
                identifierCookie.Value = Guid.NewGuid().ToString();
                identifierCookie.Expires = DateTime.Now.AddDays(1000);
                Response.Cookies.Add(identifierCookie);
            }

            return View();
        }
    }
}
