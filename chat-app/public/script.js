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
    const text = document.getElementById('messageInput').value;
    const file = document.getElementById('fileInput').files[0];

    let msg = {
        user: currentUser.username,
        text
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
    document.getElementById('messageInput').value = '';
}

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('messageInput');

    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendMessage();
        }
    });
});

function toggleAdminPanel() {
    const panel = document.getElementById('adminPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
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
    }
}

socket.on('chat message', msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.user === currentUser.username ? 'mine' : 'other');

    div.innerHTML = `<b>${msg.user}</b><br>${msg.text || ''}<br>${msg.file ? `<a href="${msg.file}" target="_blank">${msg.fileName}</a>` : ''}`;

    document.getElementById('messages').appendChild(div);
});
