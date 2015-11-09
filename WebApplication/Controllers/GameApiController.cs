using System;
using System.Collections.Generic;
using System.Net;
using System.Web;
using System.Web.Http;
using CocaineCartels.BusinessLogic;
using CocaineCartels.WebApplication.Models;

namespace CocaineCartels.WebApplication.Controllers
{
    public class GameApiController : ApiController
    {
        [HttpGet, Route("api/currentplayercolor")]
        public string GetCurrentPlayerColor()
        {
            if (HttpContext.Current.Request.UserHostAddress == null)
            {
                throw new ApplicationException("HttpContext.Current.Request.UserHostAddress is null.");
            }

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;

            Player currentPlayer = Game.Instance.GetPlayer(ipAddress, userAgent);
            return currentPlayer.Color;
        }

        [HttpGet, Route("api/gamestate")]
        public GameState GetGameState()
        {
            if (HttpContext.Current.Request.UserHostAddress == null)
            {
                throw new ApplicationException("HttpContext.Current.Request.UserHostAddress is null.");
            }

            IPAddress ipAddress = IPAddress.Parse(HttpContext.Current.Request.UserHostAddress);
            string userAgent = HttpContext.Current.Request.UserAgent;
            Player currentPlayer = Game.Instance.GetPlayer(ipAddress, userAgent);
            Board currentTurn = Game.Instance.GetCurrentTurn(currentPlayer);
            GameState state = new GameState(currentPlayer.Color, currentTurn, Game.Instance);
            return state;
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
            // TODO j: Should not take the player color for granted.
            Game.Instance.DeleteNextTurnCommands(commands.PlayerColor);

            commands.PlaceCommands.ForEach(placeCommand =>
            {
                Game.Instance.AddPlaceCommand(commands.PlayerColor, placeCommand.On.ToHex());
            });

            commands.MoveCommands.ForEach(moveCommand =>
            {
                Game.Instance.AddMoveCommand(commands.PlayerColor, moveCommand.From.ToHex(), moveCommand.To.ToHex());
            });

            Game.Instance.SetPlayerReadyStatus(commands.PlayerColor, true);
        }

        [HttpGet, Route("api/performturn")]
        public GameState PerformTurn()
        {
            Game.Instance.PerformTurn();
            return GetGameState();
        }

        [HttpGet, Route("api/players")]
        public IEnumerable<Player> GetPlayers()
        {
            return Game.Instance.Players;
        }

        [HttpGet, Route("api/reset")]
        public void ResetGame()
        {
            Game.Instance.ResetGame();
        }

        [HttpGet, Route("api/start")]
        public void StartGame()
        {
            Game.Instance.StartGame();
        }
    }
}
