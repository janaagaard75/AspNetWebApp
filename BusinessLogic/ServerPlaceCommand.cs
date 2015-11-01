namespace CocaineCartels.BusinessLogic
{
    /// <summary>A unit with a server place command is kept in the player's stack of new units.</summary>
    public class ServerPlaceCommand : ServerCommand
    {
        public ServerPlaceCommand(Unit unit, Cell on)
            : base(unit)
        {
            On = on;
        }

        internal readonly Cell On;

        public Hex OnHex => On.Hex;
    }
}
