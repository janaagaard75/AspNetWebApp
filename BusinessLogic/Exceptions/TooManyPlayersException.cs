using System;

namespace CocaineCartels.BusinessLogic.Exceptions
{
    public class TooManyPlayersException : Exception
    {
        public TooManyPlayersException(int maximumNumberOfPlayers)
        {
            MaximumNumberOfPlayers = maximumNumberOfPlayers;
        }

        public int MaximumNumberOfPlayers { get; }
    }
}
