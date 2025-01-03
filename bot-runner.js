const { runBot } = require('./src/bot');
const { closeBrowser } = require('./src/utils/browser-manager');

let isShuttingDown = false;

async function shutdown(reason) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`Shutting down bot process (${reason})`);
    try {
        await closeBrowser();
        console.log('Cleanup completed');
    } catch (e) {
        console.error('Error during shutdown:', e);
    }
    process.exit(0);
}

// Handle process termination
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const mapId = process.argv[2];
if (!mapId) {
    console.error('No map ID provided');
    process.exit(1);
}

console.log('Bot runner started');
console.log('Map ID:', mapId);

runBot(mapId).catch(async error => {
    console.error('Fatal bot error:', error);
    await shutdown('error');
}); 