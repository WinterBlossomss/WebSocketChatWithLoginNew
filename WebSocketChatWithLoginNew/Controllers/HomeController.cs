using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using WebSocketChatWithLoginNew.Data;
using WebSocketChatWithLoginNew.Hubs;
using WebSocketChatWithLoginNew.Models;
using WebSocketChatWithLoginNew.ViewModels;

namespace WebSocketChatWithLoginNew.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly WebsocketChatwithLoginContext _db;
        private readonly UserManager<IdentityUser> _userManager;

        public HomeController(WebsocketChatwithLoginContext db, UserManager<IdentityUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public async Task<IActionResult> Index()
        {
            var messages = await _db.Messages
                .Where(m => m.MesTimeDeleted == null)  
                .Include(m => m.MesUserIdfk)
                .OrderBy(m => m.MesTimeSent)
                .Take(100)
                .Select(m => new MessageViewModel
                {
                    Id = m.MesIdpk,
                    Text = m.MesMessage,
                    TimeSent = m.MesTimeSent.ToString("HH:mm"),
                    IsDeleted = m.MesTimeDeleted != null,
                    IsEdited = m.MesTimeEdited != null,
                    UserName = m.AspNetUser.UserName,
                    UserId = m.MesUserIdfk
                })
                .ToListAsync();

            ViewBag.CurrentUserId = _userManager.GetUserId(User);
            return View(messages);
        }
    }
}
