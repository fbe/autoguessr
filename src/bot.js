const { connect } = require('puppeteer-real-browser');
const config = require('./config');
const { login } = require('./utils/auth');
const { startGame, makeGuess } = require('./maps');
const { setBrowser } = require('./utils/browser-manager');

// Initialize settings with defaults from config
let botSettings = {
    ...config.botSettings
};

function updateSettings(newSettings) {
    botSettings = {
        ...botSettings,
        ...newSettings
    };
    console.log('Bot settings updated:', botSettings);
}

async function runBot(mapId, emitter) {
    let browser = null;
    let page = null;
    let isShuttingDown = false;
    let totalGames = 0;
    let totalXP = 0;
    
    function sendMessage(message) {
        if (emitter && !isShuttingDown) emitter.emit('bot-message', message);
    }
    
    try {
        sendMessage('Starting bot with map: ' + mapId);
        const connection = await connect(config.browserConfig);
        browser = connection.browser;
        page = connection.page;
        
        // Store browser reference for cleanup
        setBrowser(browser);
        
        // Add cleanup handler
        process.once('SIGTERM', async () => {
            isShuttingDown = true;
            if (browser) await browser.close().catch(() => {});
        });

        // Add error handler for page/frame detachment
        page.on('error', () => {
            isShuttingDown = true;
        });

        // Add handler for browser disconnection
        browser.on('disconnected', () => {
            isShuttingDown = true;
        });

        if (await login(page, config.email, config.password)) {
            sendMessage(`Selected map: ${mapId}`);
            
            // Initial game start
            if (!await startGame(page, mapId)) {
                throw new Error('Failed to start initial game');
            }
            
            while (!isShuttingDown) {
                try {
                    let gameCompleted = false;
                    
                    // Play 5 rounds
                    for (let i = 0; i < 5 && !isShuttingDown; i++) {
                        const guessResult = await makeGuess(page, mapId);
                        if (!guessResult) {
                            throw new Error('Failed to make guess');
                        }
                        await new Promise(r => setTimeout(r, 500));
                    }
                    
                    if (!isShuttingDown) {
                        // Try to get XP gained
                        try {
                            await page.waitForSelector('.xp-progress-bar_xpProgress__K8BSg', { timeout: 5000 });
                            
                            const xpGained = await page.evaluate(() => {
                                const xpElement = document.querySelector('.xp-progress-bar_xpProgress__K8BSg');
                                const match = xpElement?.textContent.match(/\+\s*(\d+)\s*XP/);
                                return match ? parseInt(match[1]) : 0;
                            });
                            
                            if (xpGained > 0) {
                                const levelInfo = await page.evaluate(() => {
                                    const levelElement = document.querySelector('.xp-progress-bar_currentLevel__s4v11');
                                    const progressElement = document.querySelector('.progress-bar_label__VACXk');
                                    
                                    if (levelElement && progressElement) {
                                        const level = levelElement.textContent.replace('Lvl ', '');
                                        const progress = progressElement.textContent.trim();
                                        return `Level ${level} (${progress})`;
                                    }
                                    return '';
                                });
                                
                                totalGames++;
                                totalXP += xpGained;
                                gameCompleted = true;
                                
                                sendMessage(`[${totalGames}] ${xpGained}XP -> ${levelInfo}`);
                            }
                            
                            await page.evaluate(() => {
                                const playAgainButton = document.querySelector('#__next > div.in-game_root__8QarP.in-game_backgroundDefault__kgVVj > div.in-game_content__KO9vD > main > div.result-layout_root__fRPgH > div > div.result-layout_bottomNew__Lsp9L.result-layout_bottomNewStandard__P6Cg6 > div > div.standard-final-result_wrapper__MoXZL > div.standard-final-result_primaryButton__hJeQb > div > div > button');
                                if (playAgainButton) {
                                    playAgainButton.click();
                                }
                            });
                            
                            // Wait for new game to load
                            await page.waitForSelector('.guess-map_canvas__cvpqv', { timeout: 5000 });
                        } catch (e) {
                            console.log('Error during game completion:', e);
                            throw e;  // Propagate error to outer catch
                        }
                    }
                } catch (e) {
                    if (e.message?.includes('detached Frame') || 
                        e.message?.includes('Session closed') || 
                        e.message?.includes('Target closed') ||
                        e.message?.includes('Protocol error')) {
                        isShuttingDown = true;
                        break;
                    }
                    sendMessage('Error: ' + e.message);
                    // If something goes wrong, try to restart the game
                    if (!await startGame(page, mapId)) {
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }
                
                if (isShuttingDown) break;
                await new Promise(r => setTimeout(r, 500));
            }
        }
    } catch (e) {
        if (!isShuttingDown) {
            sendMessage('Bot error: ' + e.message);
        }
    } finally {
        isShuttingDown = true;
        if (browser) {
            try {
                await browser.close().catch(() => {});
            } catch (e) {
                // Ignore browser close errors
            }
        }
    }
}

module.exports = { 
    runBot,
    updateSettings
}; 