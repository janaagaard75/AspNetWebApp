using System;
using Microsoft.AspNet.SignalR;

namespace WebApplication.Hubs
{
    public class GameHub : Hub
    {
        public void GetPlayerColor()
        {
            int random = new Random().Next(6);
            Clients.Caller.setPlayerColor(random.ToString());
        }
    }
}
