let connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();
let id = 0;
document.addEventListener("DOMContentLoaded", () => {


})

connection.start().then(function () {
    
}).catch(function (err) {
    return console.error(err.toString());
})

//Send message to the Server
document.getElementById("sendMessageId").addEventListener("click", function () {
    let message = document.getElementById("messageInputId").value;
    connection.invoke("SendMessage", message).catch(function (err) {
        return console.error(err.toString());
    });
});

document.getElementById("registerSubmit").addEventListener("click", function () {

})

//Receive message from the Server and show them

connection.on("ReceiveMessage", (msg) => {
    const isOwn = msg.userId === currentUserId;
    const justify = isOwn ? "justify-content-end sent" : "justify-content-start recv";
    const box = document.getElementById("chat-box");

    const wrap = document.createElement("div");
    wrap.id = `msg-${msg.id}`;
    wrap.className = `d-flex mb-2 ${justify}`;
    wrap.innerHTML = `
      <div>
        ${!isOwn ? `<div class="text-muted small mb-1">${esc(msg.userName)}</div>` : ''}
        <div class="d-flex align-items-end gap-1 ${isOwn ? 'flex-row-reverse' : ''}">
          <div class="bubble" id="bubble-${msg.id}">${esc(msg.text)}</div>
          ${isOwn ? `
          <div class="msg-actions d-flex gap-1 mb-1">
            <button class="btn btn-sm btn-outline-secondary py-0 px-1"
                    style="font-size:.72rem"
                    onclick="startEdit(${msg.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger py-0 px-1"
                    style="font-size:.72rem"
                    onclick="deleteMsg(${msg.id})">Del</button>
          </div>` : ''}
        </div>
        <div class="edit-area mt-1" id="edit-${msg.id}">
          <textarea class="form-control form-control-sm mb-1"
                    id="editInput-${msg.id}" rows="2">${esc(msg.text)}</textarea>
          <div class="d-flex gap-1 justify-content-end">
            <button class="btn btn-sm btn-secondary" onclick="cancelEdit(${msg.id})">Cancel</button>
            <button class="btn btn-sm btn-primary"   onclick="saveEdit(${msg.id})">Save</button>
          </div>
        </div>
        <div class="msg-time ${isOwn ? 'text-end' : ''}">${msg.timeSent}</div>
      </div>`;

    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
});

// ── Helpers ──────────────────────────────────────────────
function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
}

function esc(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}
