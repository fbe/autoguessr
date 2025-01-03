let browserInstance = null;
let isClosing = false;

function setBrowser(browser) {
    browserInstance = browser;
}

function getBrowser() {
    return browserInstance;
}

async function closeBrowser() {
    if (!browserInstance || isClosing) return;
    
    isClosing = true;
    try {
        // Remove all listeners to prevent error messages
        const pages = await browserInstance.pages();
        for (const page of pages) {
            await page.removeAllListeners();
        }
        
        // Close all pages first
        await Promise.all(pages.map(page => page.close().catch(() => {})));
        
        // Close the browser
        await browserInstance.close().catch(() => {});
    } catch (e) {
        // Suppress errors during cleanup
    } finally {
        browserInstance = null;
        isClosing = false;
    }
}

module.exports = {
    setBrowser,
    getBrowser,
    closeBrowser
}; 