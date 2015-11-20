using Newtonsoft.Json;

namespace CocaineCartels.BusinessLogic
{
    public class Settings
    {
        [JsonProperty] internal const GameModeType GameMode = GameModeType.AlliancesInSeparateTurns;

        [JsonProperty] public const int GridSize = 1;
        [JsonProperty] public const int MovesPerTurn = 5;
        [JsonProperty] public const int NewUnitPerCellsControlled = 2 * NewUnitsPerTurn + 1;
        [JsonProperty] public const int NewUnitsPerTurn = 3;
        [JsonProperty] public const int NumberOfStartingUnits = 3;
    }
}
