const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Set up multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Set up database connection
const db = new sqlite3.Database('mydb.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// Create table if not exists
db.run('CREATE TABLE IF NOT EXISTS images (id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, data BLOB)', function(err) {
    if (err) {
        console.error(err.message);
    }
    console.log('Table created successfully.');
});

// Set up route to serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const imageDetails = {
        filename: req.file.originalname,
        data: req.file.buffer
    };

    // Insert image details into the database
    db.run('INSERT INTO images(filename, data) VALUES (?, ?)', [imageDetails.filename, imageDetails.data], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error uploading image.');
        } else {
            console.log(`Image uploaded successfully with rowid ${this.lastID}`);
            res.sendStatus(200);
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});