const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();

app.use(cors());
app.use(express.json());

let browser = null;
let page = null;

async function startBrowser() {

    console.log("OPENING CHROMIUM...");

    browser = await puppeteer.launch({

        headless: false,

        userDataDir: "D:/chrome-affiliate",

        defaultViewport: null,

        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--start-maximized"
        ]

    });

    page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {

        Object.defineProperty(navigator, "webdriver", {
            get: () => false,
        });

    });

    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    );

    console.log("CHROMIUM READY");
}

app.get("/", (req, res) => {

    res.send("AGENT RUNNING");

});

app.get("/browser-status", async (req, res) => {

    try {

        if (!browser || !page) {

            return res.json({
                success: false,
                browser: false
            });

        }

        const url = page.url();

        res.json({
            success: true,
            browser: true,
            currentUrl: url
        });

    } catch (e) {

        res.json({
            success: false,
            error: e.toString()
        });

    }

});

app.post("/convert", async (req, res) => {

    try {

        const url = req.body.url;

        if (!url) {

            return res.json({
                success: false,
                error: "missing_url"
            });

        }

        console.log("NEW URL:", url);

        if (!page) {

            return res.json({
                success: false,
                error: "browser_not_ready"
            });

        }

        await page.goto(
            "https://affiliate.shopee.vn/offer/custom_link",
            {
                waitUntil: "networkidle2",
                timeout: 60000
            }
        );

        await new Promise(r => setTimeout(r, 3000));

        const textarea = await page.$("textarea");

        if (!textarea) {

            return res.json({
                success: false,
                error: "textarea_not_found"
            });

        }

        await page.evaluate(() => {

            const el = document.querySelector("textarea");

            if (el) {
                el.value = "";
            }

        });

        await page.type("textarea", url);

        await page.keyboard.press("Enter");

        console.log("WAITING RESULT...");

        await new Promise(r => setTimeout(r, 8000));

        const html = await page.content();

        res.json({
            success: true,
            html
        });

    } catch (e) {

        console.log("CONVERT ERROR:");
        console.log(e);

        res.json({
            success: false,
            error: e.toString()
        });

    }

});

app.listen(3000, async () => {

    console.log("AGENT RUNNING PORT 3000");

    try {

        await startBrowser();

    } catch (e) {

        console.log("CHROMIUM ERROR:");
        console.log(e);

    }

});