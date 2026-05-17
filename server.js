const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const app = express();

app.use(cors());
app.use(express.json());

let browser;
let page;

async function startBrowser() {

    console.log("STARTING CHROMIUM...");

    browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    page = await browser.newPage();

    await page.goto("https://affiliate.shopee.vn/", {
        waitUntil: "networkidle2"
    });

    console.log("CHROMIUM READY");
}

app.get("/", (req, res) => {
    res.send("SERVER RUNNING");
});

app.get("/browser-status", (req, res) => {

    res.json({
        browser_running: !!browser,
        page_ready: !!page
    });

});

app.post("/convert", async (req, res) => {

    try {

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: "Missing URL"
            });
        }

        if (!page) {
            return res.status(500).json({
                success: false,
                message: "Browser not ready"
            });
        }

        console.log("NEW REQUEST:", url);

        return res.json({
            success: true,
            original_url: url,
            affiliate_url: "PENDING_REAL_SHOPEE_LINK"
        });

    } catch (err) {

        console.log(err);

        return res.status(500).json({
            success: false,
            error: err.message
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {

    console.log("SERVER RUNNING ON PORT " + PORT);

    await startBrowser();

});