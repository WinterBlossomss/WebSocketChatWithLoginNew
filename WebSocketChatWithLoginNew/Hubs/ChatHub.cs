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

            await Clients.All.SendAsync("ReceiveMessage", message, _userManager.GetUserName(Context.User), _userManager.GetUserId(Context.User), newMessage.MesIdpk);
        }

        public async Task DeleteMessage(int messageId)
        {
            var userId = _userManager.GetUserId(Context.User);
            var message = await _context.Messages.FindAsync(messageId);
            if (message == null || message.MesUserIdfk != userId) return;

            message.MesTimeDeleted = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await Clients.All.SendAsync("MessageDeleted", messageId);
        }

        public async Task EditMessage(int messageId, string newText)
        {
            if (string.IsNullOrWhiteSpace(newText)) return;
            var userId = _userManager.GetUserId(Context.User);
            var message = await _context.Messages.FindAsync(messageId);
            if (message == null || message.MesUserIdfk != userId) return;

            message.MesMessage = newText;
            message.MesTimeEdited = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await Clients.All.SendAsync("MessageEdited", messageId, newText);
        }

    }
}
