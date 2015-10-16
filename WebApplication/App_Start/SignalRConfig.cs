using CocaineCartels.WebApplication;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(SignalRConfig))]
namespace CocaineCartels.WebApplication
{
    public static class SignalRConfig
    {
        public static void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
