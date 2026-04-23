namespace WebSocketChatWithLoginNew.ViewModels
{
    public class MessageViewModel
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public string TimeSent { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsEdited { get; set; }
        public string UserName { get; set; }
        public string UserId { get; set; }
    }
}
