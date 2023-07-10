const path = require('path')
    , fs = require('fs')
    , Webpack = require('webpack')
    , WebpackDevServer = require('webpack-dev-server');

const config = require('./webpack.config.dev')
    , compiler = Webpack(config)
    , devServerOptions = {
        ...config.devServer,
        open: false,
        client: {
            logging: 'none'
        }
    }
    , server = new WebpackDevServer(devServerOptions, compiler);

const puppeteer = require('puppeteer');
const visualizationsMetas = require('./src/content/viz.json');

const vizList = Object.keys(visualizationsMetas);
const langFlags = ['fr', 'en'];
const basePath = path.join(__dirname, 'public');

[
    path.join(basePath, 'thumbnails'),
    path.join(basePath, 'thumbnails', 'fr'),
    path.join(basePath, 'thumbnails', 'en')
].forEach((pathToLangDir) => {
    if (fs.existsSync(pathToLangDir) === false) {
        fs.mkdirSync(pathToLangDir);
    }
});

(async () => {
    console.log('preparation');

    await server.start();
    const browser = await puppeteer.launch({
        // headless: false
    });

    console.log('launch');

    for (const vizId of vizList) {
        console.log('screenshot for ', vizId);
        for (const lang of langFlags) {
            const page = await browser.newPage();
            await page.setViewport({
                width: 1200,
                height: 800,
                deviceScaleFactor: 1,
            });

            const pathToSave = path.join(basePath, 'thumbnails', lang, `${vizId}.png`)
            const url = `http://localhost:${devServerOptions.port}/#/${lang}/visualization/${vizId}`;
            console.log('goto', url);
            await page.goto(url);

            try {
                await page.waitForSelector('.viz-render', {
                    visible: true,
                    timeout: 5000 // five seconds
                });
            } catch (error) {
                console.log('failed');
                await page.close();
                continue;
            }
            // await page.waitForTimeout(3000);

            await page.screenshot({
                path: pathToSave,
                fullPage: true
            });
            await page.close();
            console.log('done');
        }
    }

    const homePage = await browser.newPage();
    console.log('screenshot for ', 'social networks');
    try {
        await homePage.setViewport({
            width: 1905,
            height: 952,
            deviceScaleFactor: 1,
        });
        await homePage.goto(`http://localhost:${devServerOptions.port}/#/fr/`);
    } catch (error) {
        console.log('failed');
        await page.close();
    }
    await homePage.screenshot({
        path: path.join(basePath, 'thumbnails', `marseille-rs.png`),
        fullPage: false
    });

    await browser.close();
    await server.stop();
})();