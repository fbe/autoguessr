const { saveSession, loadSession } = require('./session');

async function isLoggedIn(page) {
    try {
        const result = await page.evaluate(() => {
            // Check if we're on the login page
            if (window.location.href.includes('/signin')) return false;
            
            // Check for profile element
            const profileElement = document.querySelector('div[class*="header-desktop_profile"]');
            if (profileElement) return true;
            
            // Check for sign in button
            const signInButton = document.querySelector('button[data-qa="signin-button"]');
            if (signInButton) return false;
            
            // Check local storage tokens
            return !!(localStorage.getItem('token') || localStorage.getItem('auth'));
        });
        return result;
    } catch (e) {
        return false;
    }
}

async function login(page, email, password) {
    try {
        // First try to use saved session
        if (await loadSession(page)) {
            await page.goto('https://www.geoguessr.com');
            await new Promise(r => setTimeout(r, 1000));
            
            if (await isLoggedIn(page)) {
                console.log('Logged in using saved session');
                return true;
            }
        }

        // If session failed, do manual login
        await page.goto('https://www.geoguessr.com/signin');
        await new Promise(r => setTimeout(r, 1000));
        
        // Accept cookies if present
        await page.evaluate(() => {
            const cookieButton = document.querySelector('#accept-choices');
            if (cookieButton) cookieButton.click();
        });
        
        // Wait for and fill login form using the old working selectors
        await page.waitForSelector('input[name="email"]');
        await page.type('input[name="email"]', email);
        await page.type('input[name="password"]', password);
        
        // Wait a bit before clicking login
        await new Promise(r => setTimeout(r, 2000));
        
        // Click login button using the old working selector
        await page.evaluate(() => {
            const loginButton = document.querySelector('#__next > div > div.version4_layout__XumXk.version4_noSideTray__OFtLJ > div.version4_content__ukQvy.version4_resetOverflow__IVwXw > main > div.fullscreen-container_container__agaoW > div > form > div > div.auth_forgotAndLoginButtonWrapper__8U8UF > div.form-field_formField__8jNau.form-field_typeActions__V8Omm > div > button');
            if (loginButton) loginButton.click();
        });
        
        // Wait for navigation and check login status
        await page.waitForNavigation();
        
        if (await isLoggedIn(page)) {
            await saveSession(page);
            return true;
        }
        
        return false;
    } catch (e) {
        console.error('Login failed:', e);
        return false;
    }
}

module.exports = { login, isLoggedIn }; 