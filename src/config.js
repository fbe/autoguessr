const fs = require('fs');
const path = require('path');

// Load settings.json
const settingsPath = path.join(__dirname, '../settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));

module.exports = {
    email: settings.email,
    password: settings.password,
    minDistance: settings.minDistance,
    maxDistance: settings.maxDistance,
    useFixedCoords: settings.useFixedCoords,
    browserConfig: {
        headless: true,
        turnstile: true,
        disableXvfb: false,
        ignoreAllFlags: false,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-webgl",
            "--disable-threaded-scrolling",
            "--no-zygote",
            "--disable-extensions"
        ],
        customConfig: {},
        connectOption: {
            defaultViewport: {
                width: 1024,
                height: 768
            }
        }
    }
}; 