const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright-core');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

let browser = null;
let page = null;

/*
|--------------------------------------------------------------------------
| START BROWSER
|--------------------------------------------------------------------------
*/

async function startBrowser() {

    try {

        console.log('STARTING CHROMIUM...');

        const executablePath = process.env.RENDER
            ? '/usr/bin/chromium-browser'
            : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

        console.log('CHROME PATH:', executablePath);

        browser = await chromium.launch({

            executablePath,

            headless: true,

            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080'
            ]

        });

        const context = await browser.newContext({

            viewport: {
                width: 1920,
                height: 1080
            },

            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

        });

        page = await context.newPage();

        await page.addInitScript(() => {

            Object.defineProperty(navigator, 'webdriver', {
                get: () => false
            });

        });

        console.log('CHROMIUM STARTED');

    } catch (error) {

        console.log('CHROMIUM ERROR:');
        console.log(error);

    }

}

/*
|--------------------------------------------------------------------------
| HOME
|--------------------------------------------------------------------------
*/

app.get('/', async (req, res) => {

    res.json({
        success: true,
        message: 'Shopee Engine Running'
    });

});

/*
|--------------------------------------------------------------------------
| TEST
|--------------------------------------------------------------------------
*/

app.get('/test-shopee', async (req, res) => {

    try {

        if (!page) {

            return res.json({
                success: false,
                error: 'Browser not started'
            });

        }

        await page.goto(
            'https://affiliate.shopee.vn/',
            {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            }
        );

        await page.waitForTimeout(5000);

        res.json({
            success: true,
            title: await page.title(),
            currentUrl: page.url()
        });

    } catch (error) {

        res.json({
            success: false,
            error: error.toString()
        });

    }

});

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

app.get('/browser-status', async (req, res) => {

    res.json({
        success: true,
        browser: !!browser,
        currentUrl: page ? page.url() : null
    });

});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, async () => {

    console.log(`SERVER RUNNING ON PORT ${PORT}`);

    await startBrowser();

});