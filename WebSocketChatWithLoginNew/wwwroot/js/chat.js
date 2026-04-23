let connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.start().then(() => {
    const box = document.getElementById("chatBoxId");
    box.scrollTop = box.scrollHeight;
}).catch(err => console.error(err.toString()));

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

connection.on("ReceiveMessage", (message, userName, userId, messageId) => {
    const box = document.getElementById("chatBoxId");
    const currentUserId = box.dataset.currentUserId;
    const isSent = userId === currentUserId;
    const side = isSent ? "sent" : "recv";
    const initials = userName.substring(0, 2).toUpperCase();

    const wrap = document.createElement("div");
    wrap.className = `msg-row ${side}`;
    wrap.dataset.messageId = messageId;
    wrap.innerHTML = `
        <div class="avatar-initials">${esc(initials)}</div>
        <div class="msg-inner">
            <div class="msg-name">${esc(userName)}</div>
            <div class="bubble">${esc(message)}</div>
            ${isSent ? `
            <div class="msg-actions">
                <button class="msg-btn edit-btn">Edit</button>
                <button class="msg-btn delete-btn">Delete</button>
            </div>` : ''}
        </div>`;

    if (isSent) {
        wrap.querySelector('.delete-btn').addEventListener('click', () => deleteMessage(messageId, wrap));
        wrap.querySelector('.edit-btn').addEventListener('click', () => startEdit(messageId, wrap));
    }

    box.appendChild(wrap);
    box.scrollTop = box.scrollHeight;
});

function deleteMessage(messageId, wrap) {
    connection.invoke("DeleteMessage", messageId).catch(console.error);
}

function startEdit(messageId, wrap) {
    const bubble = wrap.querySelector('.bubble');
    const current = bubble.textContent;
    bubble.innerHTML = `
        <input class="edit-input" value="${esc(current)}" />
        <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="msg-btn save-btn">Save</button>
            <button class="msg-btn cancel-btn">Cancel</button>
        </div>`;
    bubble.querySelector('.save-btn').addEventListener('click', () => {
        const newText = bubble.querySelector('.edit-input').value.trim();
        if (newText) connection.invoke("EditMessage", messageId, newText).catch(console.error);
    });
    bubble.querySelector('.cancel-btn').addEventListener('click', () => {
        bubble.textContent = current;
    });
}

document.getElementById("chatBoxId").addEventListener("click", function (e) {
    const deleteBtn = e.target.closest(".delete-btn");
    const editBtn = e.target.closest(".edit-btn");

    if (deleteBtn) {
        const messageId = parseInt(deleteBtn.dataset.id);
        connection.invoke("DeleteMessage", messageId).catch(console.error);
    }
    if (editBtn) {
        const messageId = parseInt(editBtn.dataset.id);
        const wrap = editBtn.closest(".msg-row");
        startEdit(messageId, wrap);
    }
});

//Delete

connection.on("MessageDeleted", (messageId) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) el.remove();
});




//Edit

connection.on("MessageEdited", (messageId, newText) => {
    const el = document.querySelector(`[data-message-id="${messageId}"]`);
    if (el) el.querySelector('.bubble').textContent = newText;
});

//function deleteMessageById(messageId, btn) {
//    connection.invoke("DeleteMessage", messageId).catch(console.error);
//}

//function startEditById(messageId, btn) {
//    const wrap = btn.closest('.msg-row');
//    startEdit(messageId, wrap);
//}

function esc(t) {
    const d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
}