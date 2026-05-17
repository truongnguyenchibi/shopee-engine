const express = require("express");
const cors = require("cors");
const { chromium } = require("playwright");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("SERVER RUNNING");
});

app.get("/browser-status", (req, res) => {
    res.json({
        success: true
    });
});

app.get("/test-shopee", async (req, res) => {

    let browser;

    try {

        console.log("OPENING PLAYWRIGHT...");

        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        });

        const context = await browser.newContext({

            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",

            viewport: {
                width: 1366,
                height: 768
            },

            locale: "vi-VN",

            timezoneId: "Asia/Ho_Chi_Minh"
        });

        const page = await context.newPage();

        await page.goto(
            "https://affiliate.shopee.vn/",
            {
                waitUntil: "domcontentloaded",
                timeout: 60000
            }
        );

        const title = await page.title();

        const currentUrl = page.url();

        console.log("TITLE:", title);
        console.log("URL:", currentUrl);

        await browser.close();

        return res.json({
            success: true,
            title,
            currentUrl
        });

    } catch (e) {

        console.log("TEST ERROR:");
        console.log(e);

        if (browser) {
            await browser.close();
        }

        return res.json({
            success: false,
            error: e.toString()
        });

    }

});

app.post("/convert", async (req, res) => {

    let browser;

    try {

        const { url } = req.body;

        if (!url) {
            return res.json({
                success: false,
                error: "missing_url"
            });
        }

        console.log("OPENING BROWSER...");

        browser = await chromium.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--disable-gpu"
            ]
        });

        const context = await browser.newContext({

            userAgent:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",

            viewport: {
                width: 1366,
                height: 768
            },

            locale: "vi-VN",

            timezoneId: "Asia/Ho_Chi_Minh"
        });

        const page = await context.newPage();

        await page.goto(
            "https://affiliate.shopee.vn/",
            {
                waitUntil: "domcontentloaded",
                timeout: 60000
            }
        );

        const currentUrl = page.url();

        console.log("CURRENT URL:", currentUrl);

        await browser.close();

        return res.json({
            success: true,
            currentUrl
        });

    } catch (e) {

        console.log("CONVERT ERROR:");
        console.log(e);

        if (browser) {
            await browser.close();
        }

        return res.json({
            success: false,
            error: e.toString()
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT", PORT);
});