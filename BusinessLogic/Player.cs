using System.Net;

namespace CocaineCartels.BusinessLogic
{
    public class Player
    {
        internal Player(string color, IPAddress ipAddress, string userAgent)
        {
            Color = color;
            IpAddress = ipAddress;
            UserAgent = userAgent;
        }

        public string Color { get; private set; }
        public IPAddress IpAddress { get; private set; }
        public string UserAgent { get; private set; }
    }
}
