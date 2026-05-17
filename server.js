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

        /*
        |--------------------------------------------------------------------------
        | CHROME PATH
        |--------------------------------------------------------------------------
        */

        const chromePath =
            process.platform === 'win32'
                ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                : '/usr/bin/google-chrome-stable';

        console.log('CHROME PATH:', chromePath);

        /*
        |--------------------------------------------------------------------------
        | LAUNCH
        |--------------------------------------------------------------------------
        */

        browser = await chromium.launch({

            headless: true,

            executablePath:
                process.env.CHROME_PATH || chromePath,

            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1920,1080'
            ]

        });

        /*
        |--------------------------------------------------------------------------
        | CONTEXT
        |--------------------------------------------------------------------------
        */

        const context = await browser.newContext({

            viewport: {
                width: 1920,
                height: 1080
            },

            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'

        });

        page = await context.newPage();

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
| TEST SHOPEE
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

        console.log('OPENING SHOPEE...');

        await page.goto(
            'https://affiliate.shopee.vn/',
            {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            }
        );

        await page.waitForTimeout(5000);

        const title = await page.title();

        const currentUrl = page.url();

        res.json({
            success: true,
            title,
            currentUrl
        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            error: error.toString()
        });

    }

});

/*
|--------------------------------------------------------------------------
| BROWSER STATUS
|--------------------------------------------------------------------------
*/

app.get('/browser-status', async (req, res) => {

    try {

        res.json({
            success: true,
            browser: !!browser,
            currentUrl: page ? page.url() : null
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
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, async () => {

    console.log(`SERVER RUNNING ON PORT ${PORT}`);

    await startBrowser();

});