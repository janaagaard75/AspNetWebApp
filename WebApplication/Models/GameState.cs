using CocaineCartels.BusinessLogic;

namespace CocaineCartels.WebApplication.Models
{
    public class GameState
    {
        public GameState(string currentPlayerColor, Game gameInstance)
        {
            CurrentPlayerColor = currentPlayerColor;
            GameInstance = gameInstance;
        }

        public string CurrentPlayerColor { get; }
        public Game GameInstance { get; }
    }
}
