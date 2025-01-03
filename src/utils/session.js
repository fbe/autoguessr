const fs = require('fs');
const path = require('path');

const sessionPath = path.join(__dirname, '../../session.json');

async function saveSession(page) {
    try {
        // Get all cookies
        const cookies = await page.cookies();
        
        // Get auth tokens from localStorage
        const tokens = await page.evaluate(() => {
            return {
                token: localStorage.getItem('token'),
                auth: localStorage.getItem('auth'),
                refresh: localStorage.getItem('refresh_token'),
                session: localStorage.getItem('session')
            };
        });

        // Save both cookies and tokens
        const sessionData = {
            cookies,
            tokens
        };

        fs.writeFileSync(sessionPath, JSON.stringify(sessionData, null, 2));
        console.log('Session saved successfully');
        return true;
    } catch (e) {
        console.error('Failed to save session:', e);
        return false;
    }
}

async function loadSession(page) {
    try {
        if (!fs.existsSync(sessionPath)) return false;
        
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf8'));
        
        // Set cookies
        if (sessionData.cookies?.length > 0) {
            await page.setCookie(...sessionData.cookies);
        }
        
        // Set localStorage tokens
        if (sessionData.tokens) {
            await page.evaluate((tokens) => {
                for (const [key, value] of Object.entries(tokens)) {
                    if (value) localStorage.setItem(key, value);
                }
            }, sessionData.tokens);
        }
        
        return true;
    } catch (e) {
        console.error('Failed to load session:', e);
        return false;
    }
}

module.exports = { saveSession, loadSession }; 