const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('SERVER RUNNING');
});

app.post('/convert', (req, res) => {

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            success: false,
            message: 'Missing URL'
        });
    }

    return res.json({
        success: true,
        original_url: url,
        affiliate_url: 'DEMO_LINK'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('SERVER RUNNING ON PORT ' + PORT);
});