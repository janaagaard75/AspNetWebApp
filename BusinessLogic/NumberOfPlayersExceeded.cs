using System;

namespace CocaineCartels.BusinessLogic
{
    public class NumberOfPlayersExceeded : Exception
    {
        internal NumberOfPlayersExceeded(int maximumAllowed)
            : base($"Could not another player since that would exceed the maximum allowed of {maximumAllowed}.")
        { }
    }
}
