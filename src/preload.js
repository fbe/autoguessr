const { contextBridge } = require('electron');
const path = require('path');

contextBridge.exposeInMainWorld('appPath', {
    assets: path.join(__dirname, '../assets').replace(/\\/g, '/')
}); 