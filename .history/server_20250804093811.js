const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to get game balance (if needed for dynamic loading)
app.get('/api/balance', (req, res) => {
    try {
        delete require.cache[require.resolve('./game_balance.json')];
        const balance = require('./game_balance.json');
        res.json(balance);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load game balance' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Astronaut Idle Adventure server running on http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
});

module.exports = app;
