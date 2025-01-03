const { app, BrowserWindow, ipcMain } = require('electron');
const { init: initGui } = require('./src/gui/main');
const { getMapsList, updateSettings } = require('./src/maps');
const { runBot } = require('./src/bot');
const { spawn } = require('child_process');
const path = require('path');
const { EventEmitter } = require('events');
const botEmitter = new EventEmitter();

let mainWindow = null;
let isQuitting = false;

async function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 480,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        resizable: false,
        backgroundColor: '#1a1c23',
        autoHideMenuBar: true,
        menuBarVisible: false,
        frame: true,
        removeMenu: true
    });

    mainWindow.removeMenu();

    await mainWindow.loadFile(path.join(__dirname, 'src/gui/index.html'));
    return mainWindow;
}

function sendToRenderer(channel, message) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send(channel, message);
    }
}

async function stopBot() {
    // Use the new closeBrowser function
    const { closeBrowser } = require('./src/utils/browser-manager');
    await closeBrowser();
    
    return Promise.resolve();
}

async function main() {
    console.log('Starting GUI...');
    try {
        mainWindow = await createMainWindow();
        
        // Handle map selection
        ipcMain.on('map-selected', async (_, mapId) => {
            try {
                // Stop the current bot and close browser
                await stopBot();
                
                // Wait a moment to ensure browser is fully closed
                await new Promise(r => setTimeout(r, 1000));
                
                console.log('Selected map:', mapId);
                
                // Remove any existing listeners to prevent duplicates
                botEmitter.removeAllListeners('bot-message');
                
                // Set up bot message handling
                botEmitter.on('bot-message', (message) => {
                    if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send('bot-update', message);
                    }
                });
                
                // Run bot with message handler
                runBot(mapId, botEmitter);
            } catch (error) {
                console.error('Error during map selection:', error);
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('bot-error', error.message);
                }
            }
        });

        // Handle stop request
        ipcMain.on('stop-bot', async () => {
            await stopBot();
        });

        // Update the settings handler
        ipcMain.on('settings-updated', (_, newSettings) => {
            updateSettings(newSettings);
        });

    } catch (error) {
        console.error('Main error:', error);
        await stopBot();
    }
}

async function cleanupAndQuit() {
    if (isQuitting) return;
    isQuitting = true;
    
    console.log('Cleaning up...');
    await stopBot();

    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.destroy();
    }
    mainWindow = null;
    
    setTimeout(() => {
        app.quit();
        process.exit(0);
    }, 1000);
}

// Handle window-all-closed event
app.on('window-all-closed', cleanupAndQuit);

// Handle quit event
app.on('before-quit', (event) => {
    if (!isQuitting) {
        event.preventDefault();
        cleanupAndQuit();
    }
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', cleanupAndQuit);
process.on('SIGTERM', cleanupAndQuit);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    cleanupAndQuit();
});

// Run the program
console.log('Program started');
app.whenReady().then(main); 