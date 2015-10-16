using Microsoft.AspNet.SignalR;

namespace WebApplication.Hubs
{
    public class GameHub : Hub
    {
        public void Hello()
        {
            Clients.All.hello();
        }

        public void GetPlayerColor()
        {
            Clients.Caller.setPlayerColor("#f00");
        }
    }
}
