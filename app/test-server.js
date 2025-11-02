// Simple test server to verify the fixes
const express = require('express');
const path = require('path');
const { fttvw } = require('./functions/index.js');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/wall', async (req, res) => {
    try {
        await fttvw(req, res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/wall/lang/:language/cat/:category', async (req, res) => {
    try {
        await fttvw(req, res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/api/wall/search/:search_box', async (req, res) => {
    try {
        await fttvw(req, res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Static file routes
app.get('/api/stylesheets/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/stylesheets/style.css'));
});

app.get('/api/javascripts/webplayer.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/javascripts/webplayer.min.js'));
});

app.get('/api/images/favicon.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/images/favicon.png'));
});

// Root redirect
app.get('/', (req, res) => {
    res.redirect('/api/wall');
});

app.listen(port, () => {
    console.log(`Test server running at http://localhost:${port}`);
    console.log('Visit http://localhost:3000/api/wall to test the application');
});