const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ fileUrl: '/uploads/' + req.file.filename, fileName: req.file.originalname });
});

app.post('/login', (req, res) => {
    const users = JSON.parse(fs.readFileSync('users.json'));
    const user = users.find(
        u => u.username === req.body.username && u.password === req.body.password
    );

    if (user) res.json({ success: true, user });
    else res.json({ success: false });
});

app.post('/add-user', (req, res) => {
    const users = JSON.parse(fs.readFileSync('users.json'));
    users.push({ ...req.body, role: 'user' });
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    res.json({ success: true });
});

io.on('connection', socket => {
    socket.on('chat message', msg => io.emit('chat message', msg));
});

const PORT = process.env.PORT || 3000;

process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', err => {
    console.error('Unhandled Rejection:', err);
});

server.listen(PORT, () => {
    console.log('Running on ' + PORT);
});