using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class GameState
    {
        public GameState(string currentPlayerColor, Turn currentTurn, Game gameInstance)
        {
            CurrentPlayerColor = currentPlayerColor;
            CurrentTurn = currentTurn;
            GameInstance = gameInstance;
        }

        public string CurrentPlayerColor { get; }
        public Turn CurrentTurn { get; }
        public Game GameInstance { get; }
    }
}
