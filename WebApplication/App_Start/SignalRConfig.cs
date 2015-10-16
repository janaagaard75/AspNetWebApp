using Microsoft.Owin;
using Owin;
using WebApplication;

[assembly: OwinStartup(typeof(SignalRConfig))]
namespace WebApplication
{
    public static class SignalRConfig
    {
        public static void Configuration(IAppBuilder app)
        {
            app.MapSignalR();
        }
    }
}
