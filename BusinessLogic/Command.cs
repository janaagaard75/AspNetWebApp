
namespace CocaineCartels.BusinessLogic
{
    /// <remarks>>Units are kept in position on the next board to make it easy to reset's as player's commands. However when the game state is sent to the client the units have been moved to the updated cells.</remarks>
    public abstract class Command
    {
        internal Command(Unit unit)
        {
            Unit = unit;
        }

        internal readonly Unit Unit;
    }
}
