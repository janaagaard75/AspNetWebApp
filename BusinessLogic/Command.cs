
namespace CocaineCartels.BusinessLogic
{
    public abstract class Command
    {
        internal Command(Unit unit)
        {
            Unit = unit;
        }

        internal readonly Unit Unit;
    }
}
