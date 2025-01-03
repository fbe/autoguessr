const { ipcMain } = require('electron');

let mainWindow = null;
let resolvePromise = null;

function init(window) {
    console.log('Initializing GUI...');
    mainWindow = window;

    return new Promise((resolve) => {
        resolvePromise = resolve;

        ipcMain.on('map-selected', (_, selection) => {
            console.log('Map selected:', selection);
            if (resolvePromise) {
                resolvePromise(selection);
                resolvePromise = null;
            }
        });
    });
}

module.exports = { init }; 