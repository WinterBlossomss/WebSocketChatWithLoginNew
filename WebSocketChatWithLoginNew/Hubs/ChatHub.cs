using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using WebSocketChatWithLoginNew.Data;
using WebSocketChatWithLoginNew.Models;

namespace WebSocketChatWithLoginNew.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ILogger<ChatHub> _logger;
        private readonly WebsocketChatwithLoginContext _context;
        private readonly UserManager<IdentityUser> _userManager;


        public ChatHub(ILogger<ChatHub> logger, WebsocketChatwithLoginContext context, UserManager<IdentityUser> userManager)
        {
            _logger = logger;
            _context = context;
            _userManager = userManager;
        }

        public async Task SendMessage(string message)
        {
            if (message.IsNullOrEmpty())
                return;
            Message newMessage = new Message()
            {
                MesMessage = message,
                MesTimeSent = DateTime.Now.ToUniversalTime(),
                MesUserIdfk = _userManager.GetUserId(Context.User)
            };
            _context.Messages.Add(newMessage);
            await _context.SaveChangesAsync();

            await Clients.All.SendAsync("ReceiveMessage", message, _userManager.GetUserName(Context.User));
        }

        public async Task InformJoin(string username)
        {
            await Clients.All.SendAsync("ReceiveJoin", username);

        }
    }
}
