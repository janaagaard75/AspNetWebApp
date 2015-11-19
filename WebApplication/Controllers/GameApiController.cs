using System;
using System.Net;
using System.Web;
using System.Web.Http;
using CocaineCartels.BusinessLogic;
using CocaineCartels.WebApplication.Models;

namespace CocaineCartels.WebApplication.Controllers
{
    public class GameApiController : ApiController
    {
        private Player _CurrentPlayer;

        private Player CurrentPlayer
        {
            get
            {
                if (_CurrentPlayer == null)
                {
                    if (HttpContext.Current == null || HttpContext.Current.Request.UserHostAddress == null)
                    {
                        throw new ApplicationException("HttpContext.Current or HttpContext.Current.Request.UserHostAddress is null.");
                    }

                    IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
                    string userAgent = HttpContext.Current.Request.UserAgent;
                    _CurrentPlayer = Game.Instance.GetPlayer(ipAddress, userAgent);
                }

                return _CurrentPlayer;
            }
        }

        [HttpGet, Route("api/currentplayercolor")]
        public string GetCurrentPlayerColor()
        {
            return CurrentPlayer.Color;
        }

        [HttpGet, Route("api/gamestate")]
        public GameState GetGameState()
        {
            Turn currentTurn = Game.Instance.GetCurrentTurn(CurrentPlayer);
            GameState state = new GameState(CurrentPlayer.Color, currentTurn, Game.Instance);
            return state;
        }

        [HttpGet, Route("api/status")]
        public Status GetStatus()
        {
            Status status = new Status(Game.Instance.Players, Game.Instance.TurnNumber);
            return status;
        }

        [HttpGet, Route("api/notready")]
        public void NotReady()
        {
            string currentPlayerColor = GetCurrentPlayerColor();
            Game.Instance.SetPlayerReadyStatus(currentPlayerColor, false);
        }

        [HttpPost, Route("api/commands")]
        public void PostCommands(ClientCommands commands)
        {
            string currentPlayerColor = GetCurrentPlayerColor();

            Game.Instance.DeleteNextTurnPlaceAndMoveCommands(currentPlayerColor);

            commands.PlaceCommands.ForEach(placeCommand =>
            {
                Game.Instance.AddPlaceCommand(currentPlayerColor, placeCommand.On.ToHex());
            });

            commands.MoveCommands.ForEach(moveCommand =>
            {
                Game.Instance.AddMoveCommand(currentPlayerColor, moveCommand.From.ToHex(), moveCommand.To.ToHex());
            });

            Game.Instance.UpdateCommandsSentOn(currentPlayerColor);
            Game.Instance.SetPlayerReadyStatus(currentPlayerColor, true);
        }

        [HttpGet, Route("api/reset")]
        public void ResetGame()
        {
            Game.Instance.ResetGame();
        }

        [HttpGet, Route("api/setallplayershere/{allSeemToBeHere:bool}")]
        public void SetAllPlayersSeemToBeHere(bool allSeemToBeHere)
        {
            Game.Instance.SetAllPlayersSeemToBeHere(CurrentPlayer, allSeemToBeHere);
        }
    }
}
