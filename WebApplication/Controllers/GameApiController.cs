using System;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using CocaineCartels.BusinessLogic;
using CocaineCartels.BusinessLogic.Extensions;
using CocaineCartels.WebApplication.Models;

namespace CocaineCartels.WebApplication.Controllers
{
    public class GameApiController : ApiController
    {
        private Player CurrentPlayer
        {
            get
            {
                CookieHeaderValue idCookie = Request.Headers.GetCookies(HomeController.IdentifierCookieName).FirstOrDefault();

                if (idCookie == null)
                {
                    throw new ApplicationException("The identifier cookies was not found.");
                }

                Guid id = new Guid(idCookie.Cookies.First().Value);
                Player currentPlayer = Game.Instance.GetPlayer(id);
                return currentPlayer;
            }
        }

        private string GetCurrentPlayerColor()
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

            Game.Instance.DeleteNextTurnCommands(currentPlayerColor);

            commands.PlaceCommands?.ForEach(placeCommand =>
            {
                Game.Instance.AddPlaceCommand(currentPlayerColor, placeCommand.On.ToHex());
            });

            commands.MoveCommands?.ForEach(moveCommand =>
            {
                Game.Instance.AddMoveCommand(currentPlayerColor, moveCommand.From.ToHex(), moveCommand.To.ToHex());
            });

            commands.AllianceProposals?.ForEach(proposal =>
            {
                Game.Instance.AddAllianceProposal(currentPlayerColor, proposal.ToPlayer);
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
