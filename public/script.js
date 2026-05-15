const socket = io();
let currentUser = null;

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        currentUser = data.user;

        document.getElementById('loginBox').style.display = 'none';
        document.getElementById('chatBox').style.display = 'flex';

        if (currentUser.role === 'admin') {
            document.getElementById('adminBtn').style.display = 'block';
        }
    } else {
        alert('Login failed');
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');

    const text = input.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    let msg = {
        user: currentUser.username,
        text: text
    };

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await res.json();

        msg.file = data.fileUrl;
        msg.fileName = data.fileName;
    }

    socket.emit('chat message', msg);

    input.value = '';
    fileInput.value = '';
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
}

function insertEmoji() {
    const input = document.getElementById('messageInput');
    input.value += '😊';
    input.focus();
}

function sendLike() {
    document.getElementById('messageInput').value = '👍';
    sendMessage();
}

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.style.display =
        panel.style.display === 'none' ? 'block' : 'none';
}

async function addUser() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;

    const res = await fetch('/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {
        alert('User added successfully');
        document.getElementById('newUsername').value = '';
        document.getElementById('newPassword').value = '';
    } else {
        alert(data.message || 'Cannot add user');
    }
}

async function captureScreen() {
    try {
        await navigator.mediaDevices.getDisplayMedia({
            video: true
        });
        alert('Đã mở chọn màn hình');
    } catch (err) {
        console.log(err);
    }
}

socket.on('chat message', msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(
        msg.user === currentUser.username ? 'mine' : 'other'
    );

    let content = `
<div class="msg-top">
   <img src="https://i.pravatar.cc/35?u=${msg.user}" class="avatar">
   <b>${msg.user}</b>
</div>
`;

    if (msg.text) {
        content += `<div>${msg.text}</div>`;
    }

    if (msg.file) {
        const isImage = msg.file.match(/\.(jpg|jpeg|png|gif|webp)$/i);

        if (isImage) {
            content += `
                <img src="${msg.file}" 
                     style="max-width:220px; margin-top:8px; border-radius:12px;">
            `;
        } else {
            content += `
                <br><a href="${msg.file}" target="_blank">
                    📎 ${msg.fileName}
                </a>
            `;
        }
    }

    div.innerHTML = content;

    document.getElementById('messages').appendChild(div);

    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
});