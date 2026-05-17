const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

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

        browser = await chromium.launch({

            headless: true,

            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080'
            ]

        });

        const context = await browser.newContext({

            viewport: {
                width: 1920,
                height: 1080
            },

            userAgent:
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',

            locale: 'vi-VN',

            timezoneId: 'Asia/Ho_Chi_Minh'

        });

        page = await context.newPage();

        // fake webdriver
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

        await page.waitForTimeout(8000);

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
| CREATE AFFILIATE LINK
|--------------------------------------------------------------------------
*/

app.get('/create-link', async (req, res) => {

    try {

        const productUrl = req.query.url;

        if (!productUrl) {

            return res.json({
                success: false,
                error: 'Missing url'
            });

        }

        if (!page) {

            return res.json({
                success: false,
                error: 'Browser not started'
            });

        }

        await page.goto(
            'https://affiliate.shopee.vn/offer/custom_link',
            {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            }
        );

        await page.waitForTimeout(5000);

        // nhập link
        const input = await page.locator('input').first();

        await input.fill(productUrl);

        await page.waitForTimeout(1000);

        // click generate
        const buttons = await page.locator('button').all();

        for (const button of buttons) {

            const text = await button.innerText();

            if (
                text.includes('Tạo') ||
                text.includes('Generate') ||
                text.includes('Xác nhận')
            ) {

                await button.click();

                break;
            }

        }

        await page.waitForTimeout(5000);

        // lấy link
        const body = await page.content();

        const match = body.match(/https:\/\/s\.shopee\.vn\/[A-Za-z0-9]+/);

        if (match) {

            return res.json({
                success: true,
                affiliate_link: match[0]
            });

        }

        res.json({
            success: false,
            error: 'Affiliate link not found',
            currentUrl: page.url()
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