const express = require('express');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// File upload configuration
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('file'), (req, res) => {
    res.status(200).send('File uploaded successfully');
});

// API untuk menjalankan skrip Node.js
app.post('/run-script', (req, res) => {
    const { script } = req.body;

    try {
        const output = eval(script);
        io.emit('script-output', output);
        res.status(200).send({ output });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
