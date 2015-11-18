namespace CocaineCartels.BusinessLogic
{
    // Must match the enum in AlliancesSystem.ts.
    public enum AlliancesSystem
    {
        Undefined,

        /// <summary>Alliances are planned in turns separate from moves. Forming </summary>
        AlliancesInSeparateTurns,

        AlliancesEveryTurn,
        AlliancesSeconndTurn,
        NoAlliances
    }
}
