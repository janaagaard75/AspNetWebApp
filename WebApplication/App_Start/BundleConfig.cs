using System.Web.Optimization;

namespace CocaineCartels.WebApplication
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/bundles/css")
                .Include("~/content/main.css"));

            bundles.Add(new ScriptBundle("~/bundles/scripts")
                .Include(
                    "~/scripts/jquery-{version}.js",
                    "~/scripts/konva.js",
                    "~/scripts/tinycolor.js",
                    "~/scripts/combined.js"));
        }
    }
}
