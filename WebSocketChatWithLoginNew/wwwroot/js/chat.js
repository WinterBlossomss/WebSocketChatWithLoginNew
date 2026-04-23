let connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.start().catch(err => console.error(err.toString()));

document.getElementById("sendMessageId").addEventListener("click", sendMessage);

document.getElementById("messageInputId").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById("messageInputId");
    const message = input.value.trim();
    if (!message) return;
    connection.invoke("SendMessage", message).catch(err => console.error(err.toString()));
    input.value = "";
}

connection.on("ReceiveMessage", (message, userName) => {
    const box = document.getElementById("chatBoxId");

    const wrap = document.createElement("div");
    wrap.className = "d-flex mb-2 justify-content-start recv";
    wrap.innerHTML = `
      <div>
        <div class="text-muted small mb-1">${esc(userName)}</div>
        <div class="bubble">${esc(message)}</div>
      </div>`;

    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
});

function esc(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}