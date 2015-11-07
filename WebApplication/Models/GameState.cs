using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class GameState
    {
        public GameState(string currentPlayerColor, Board currentTurn, Game gameInstance)
        {
            CurrentPlayerColor = currentPlayerColor;
            CurrentTurn = currentTurn;
            GameInstance = gameInstance;
        }

        public string CurrentPlayerColor { get; }
        public Board CurrentTurn { get; }
        public Game GameInstance { get; }
    }
}
