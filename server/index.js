const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/vps-panel', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// File upload configuration
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

const FileSchema = new mongoose.Schema({
    filename: String,
    path: String,
    date: { type: Date, default: Date.now }
});

const File = mongoose.model('File', FileSchema);

app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/upload', upload.single('file'), async (req, res) => {
    const file = new File({
        filename: req.file.filename,
        path: req.file.path
    });

    try {
        await file.save();
        res.status(200).send('File uploaded successfully');
    } catch (err) {
        res.status(500).send('Failed to upload file');
    }
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
