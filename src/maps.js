const fs = require('fs');
const path = require('path');

const maps = {
    // Maps with fixed coordinates
    uganda: {
        url: 'https://www.geoguessr.com/maps/uganda',
        fixedCoords: {
            lat: 0.31992552020256887,
            lng: 32.56190141140045
        }
    },
    guam: {
        url: 'https://www.geoguessr.com/maps/guam',
        fixedCoords: {
            lat: 13.466893796704655,
            lng: 144.77890491485596
        }
    },
    sao_tome: {
        url: 'https://www.geoguessr.com/maps/sao-tome-and-principe',
        fixedCoords: {
            lat: 0.33901944164254155,
            lng: 6.728474149894499
        }
    },

    // Regular maps
    world: { url: 'https://www.geoguessr.com/maps/world' },
    famous_places: { url: 'https://www.geoguessr.com/maps/famous-places' },
    netherlands: { url: 'https://www.geoguessr.com/maps/netherlands' },
    europe: { url: 'https://www.geoguessr.com/maps/europe' },
    usa: { url: 'https://www.geoguessr.com/maps/usa' },
    japan: { url: 'https://www.geoguessr.com/maps/japan' },
    uk: { url: 'https://www.geoguessr.com/maps/uk' },
    france: { url: 'https://www.geoguessr.com/maps/france' },
    spain: { url: 'https://www.geoguessr.com/maps/spain' },
    canada: { url: 'https://www.geoguessr.com/maps/canada' },
    italy: { url: 'https://www.geoguessr.com/maps/italy' },
    russia: { url: 'https://www.geoguessr.com/maps/russia' },
    germany: { url: 'https://www.geoguessr.com/maps/germany' },
    australia: { url: 'https://www.geoguessr.com/maps/australia' },
    brazil: { url: 'https://www.geoguessr.com/maps/brazil' },
    turkey: { url: 'https://www.geoguessr.com/maps/turkey' },
    poland: { url: 'https://www.geoguessr.com/maps/poland' },
    india: { url: 'https://www.geoguessr.com/maps/india' },
    sweden: { url: 'https://www.geoguessr.com/maps/sweden' },
    indonesia: { url: 'https://www.geoguessr.com/maps/indonesia' },
    norway: { url: 'https://www.geoguessr.com/maps/norway' },
    argentina: { url: 'https://www.geoguessr.com/maps/argentina' },
    ukraine: { url: 'https://www.geoguessr.com/maps/ukraine' },
    switzerland: { url: 'https://www.geoguessr.com/maps/switzerland' },
    finland: { url: 'https://www.geoguessr.com/maps/finland' },
    new_zealand: { url: 'https://www.geoguessr.com/maps/new-zealand' },
    portugal: { url: 'https://www.geoguessr.com/maps/portugal' },
    ireland: { url: 'https://www.geoguessr.com/maps/ireland' },
    romania: { url: 'https://www.geoguessr.com/maps/romania' },
    denmark: { url: 'https://www.geoguessr.com/maps/denmark' },
    serbia: { url: 'https://www.geoguessr.com/maps/serbia' },
    belgium: { url: 'https://www.geoguessr.com/maps/belgium' },
    greece: { url: 'https://www.geoguessr.com/maps/greece' },
    mexico: { url: 'https://www.geoguessr.com/maps/mexico' },
    israel: { url: 'https://www.geoguessr.com/maps/israel' },
    croatia: { url: 'https://www.geoguessr.com/maps/croatia' },
    chile: { url: 'https://www.geoguessr.com/maps/chile' },
    bulgaria: { url: 'https://www.geoguessr.com/maps/bulgaria' },
    hungary: { url: 'https://www.geoguessr.com/maps/hungary' },
    czech_republic: { url: 'https://www.geoguessr.com/maps/czech-republic' },
    austria: { url: 'https://www.geoguessr.com/maps/austria' },
    thailand: { url: 'https://www.geoguessr.com/maps/thailand' },
    colombia: { url: 'https://www.geoguessr.com/maps/colombia' },
    taiwan: { url: 'https://www.geoguessr.com/maps/taiwan' },
    philippines: { url: 'https://www.geoguessr.com/maps/philippines' },
    singapore: { url: 'https://www.geoguessr.com/maps/singapore' },
    slovakia: { url: 'https://www.geoguessr.com/maps/slovakia' },
    south_africa: { url: 'https://www.geoguessr.com/maps/south-africa' },
    south_korea: { url: 'https://www.geoguessr.com/maps/south-korea' },
    lithuania: { url: 'https://www.geoguessr.com/maps/lithuania' },
    asia: { url: 'https://www.geoguessr.com/maps/asia' },
    malaysia: { url: 'https://www.geoguessr.com/maps/malaysia' },
    iceland: { url: 'https://www.geoguessr.com/maps/iceland' },
    slovenia: { url: 'https://www.geoguessr.com/maps/slovenia' },
    estonia: { url: 'https://www.geoguessr.com/maps/estonia' },
    latvia: { url: 'https://www.geoguessr.com/maps/latvia' },
    peru: { url: 'https://www.geoguessr.com/maps/peru' },
    hong_kong: { url: 'https://www.geoguessr.com/maps/hongkong' },
    ecuador: { url: 'https://www.geoguessr.com/maps/ecuador' },
    uruguay: { url: 'https://www.geoguessr.com/maps/uruguay' },
    madagascar: { url: 'https://www.geoguessr.com/maps/madagascar' },
    albania: { url: 'https://www.geoguessr.com/maps/albania' },
    greenland: { url: 'https://www.geoguessr.com/maps/greenland' },
    mongolia: { url: 'https://www.geoguessr.com/maps/mongolia' },
    north_macedonia: { url: 'https://www.geoguessr.com/maps/north-macedonia' },
    puerto_rico: { url: 'https://www.geoguessr.com/maps/puerto-rico' },
    luxembourg: { url: 'https://www.geoguessr.com/maps/luxembourg' },
    tunisia: { url: 'https://www.geoguessr.com/maps/tunisia' },
    monaco: { url: 'https://www.geoguessr.com/maps/monaco' },
    montenegro: { url: 'https://www.geoguessr.com/maps/montenegro' },
    guatemala: { url: 'https://www.geoguessr.com/maps/guatemala' },
    uae: { url: 'https://www.geoguessr.com/maps/uae' },
    nigeria: { url: 'https://www.geoguessr.com/maps/nigeria' },
    bangladesh: { url: 'https://www.geoguessr.com/maps/bangladesh' },
    malta: { url: 'https://www.geoguessr.com/maps/malta' },
    bolivia: { url: 'https://www.geoguessr.com/maps/bolivia' },
    botswana: { url: 'https://www.geoguessr.com/maps/botswana' },
    dominican_republic: { url: 'https://www.geoguessr.com/maps/dominican-republic' },
    faroe_islands: { url: 'https://www.geoguessr.com/maps/faroe-islands' },
    kyrgyzstan: { url: 'https://www.geoguessr.com/maps/kyrgyzstan' },
    sri_lanka: { url: 'https://www.geoguessr.com/maps/sri-lanka' },
    isle_of_man: { url: 'https://www.geoguessr.com/maps/isle-of-man' },
    kenya: { url: 'https://www.geoguessr.com/maps/kenya' },
    jordan: { url: 'https://www.geoguessr.com/maps/jordan' },
    cambodia: { url: 'https://www.geoguessr.com/maps/cambodia' },
    andorra: { url: 'https://www.geoguessr.com/maps/andorra' },
    kazakhstan: { url: 'https://www.geoguessr.com/maps/kazakhstan' },
    senegal: { url: 'https://www.geoguessr.com/maps/senegal' },
    christmas_island: { url: 'https://www.geoguessr.com/maps/christmas-island' },
    jersey: { url: 'https://www.geoguessr.com/maps/jersey' },
    san_marino: { url: 'https://www.geoguessr.com/maps/san-marino' },
    qatar: { url: 'https://www.geoguessr.com/maps/qatar' },
    laos: { url: 'https://www.geoguessr.com/maps/laos' },
    ghana: { url: 'https://www.geoguessr.com/maps/ghana' },
    gibraltar: { url: 'https://www.geoguessr.com/maps/gibraltar' },
    lesotho: { url: 'https://www.geoguessr.com/maps/lesotho' },
    curacao: { url: 'https://www.geoguessr.com/maps/curacao' },
    africa: { url: 'https://www.geoguessr.com/maps/africa' },
    rwanda: { url: 'https://www.geoguessr.com/maps/rwanda' },
    bhutan: { url: 'https://www.geoguessr.com/maps/bhutan' },
    eswatini: { url: 'https://www.geoguessr.com/maps/eswatini' },
    south_america: { url: 'https://www.geoguessr.com/maps/south-america' },
    panama: { url: 'https://www.geoguessr.com/maps/panama' },
    american_samoa: { url: 'https://www.geoguessr.com/maps/american-samoa' },
    us_virgin_islands: { url: 'https://www.geoguessr.com/maps/us-virgin-islands' },
    northern_mariana: { url: 'https://www.geoguessr.com/maps/northern-mariana-islands' },
    lebanon: { url: 'https://www.geoguessr.com/maps/lebanon' },
    liechtenstein: { url: 'https://www.geoguessr.com/maps/liechtenstein' },
    north_america: { url: 'https://www.geoguessr.com/maps/north-america' },
    oman: { url: 'https://www.geoguessr.com/maps/oman' },
    oceania: { url: 'https://www.geoguessr.com/maps/oceania' }
};

let globalCoordinates = {
    lat: 0,
    lng: 0
};

let globalPanoID = undefined;

let currentSettings = null;

const config = require('./config');

async function interceptRequests(page) {
    // Listen to all responses
    page.on('response', async response => {
        const url = response.url();
        if (url.includes('MapsJsInternalService/GetMetadata') || 
            url.includes('MapsJsInternalService/SingleImageSearch')) {
            try {
                const text = await response.text();
                const pattern = /-?\d+\.\d+,-?\d+\.\d+/;
                const match = text.match(pattern);
                if (match) {
                    const [lat, lng] = match[0].split(',').map(Number);
                    // Just update coordinates without logging
                    globalCoordinates = { lat, lng };
                }
            } catch (e) {
                // Silent error handling
            }
        }
    });
}

async function startGame(page, mapId) {
    try {
        if (!maps[mapId]) {
            throw new Error(`Map ${mapId} not found`);
        }

        await interceptRequests(page);
        await page.goto(maps[mapId].url);
        await new Promise(r => setTimeout(r, 1000));
        
        // Click play button using their selector
        await page.evaluate(() => {
            const playButton = document.querySelector('#__next > div.background_wrapper__BE727.background_backgroundClassic__Sjpbl > div.version4_layout__XumXk > div.version4_content__ukQvy.version4_resetOverflow__IVwXw > main > div.container_sizeLarge__JiyXO > div > div.map-block_root__bInXe > div.map-selector_root__rRmhn > div > div.map-selector_playButtons__JrkFM > div > div > div > button');
            if (playButton) playButton.click();
        });

        // Wait for the game to start
        await page.waitForSelector('.guess-map_canvas__cvpqv', { timeout: 10000 });
        return true;
    } catch (e) {
        // Only log non-timeout errors
        if (!e.message?.includes('waiting for selector')) {
            console.error('Failed to start game:', e);
        }
        return false;
    }
}

function getRandomCoords(mapId) {
    // Use fixed coordinates if available for the map, otherwise use intercepted coordinates
    return maps[mapId]?.fixedCoords || globalCoordinates;
}

// Add this function to get a formatted list of maps
function getMapsList() {
    return Object.entries(maps).map(([id, data]) => {
        // Convert id to readable name (e.g., 'sao_tome' -> 'Sao Tome')
        const name = id
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        return {
            id,
            name,
            url: data.url,
            hasFixedCoords: !!data.fixedCoords
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
}

// Add this function to update settings
function updateSettings(newSettings) {
    currentSettings = newSettings;
}

async function makeGuess(page, mapId) {
    try {
        await page.waitForSelector('.guess-map_canvas__cvpqv', { timeout: 5000 });
        const map = await page.$('.guess-map_canvas__cvpqv');
        
        // Hide GeoGuessr icon
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = `
                .game-header_logo__Qj_j1,
                .game-header_logoMobile__Yh4Aq {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        });

        // Use current settings or read from file if not set
        if (!currentSettings) {
            currentSettings = JSON.parse(fs.readFileSync(path.join(__dirname, '../settings.json'), 'utf8'));
        }
        
        // If fixed coords are enabled and map has fixed coords, use them without randomization
        if (currentSettings.useFixedCoords && maps[mapId]?.fixedCoords) {
            const coords = maps[mapId].fixedCoords;
            
            // Place marker using their method
            await page.evaluate(({lat, lng}) => {
                const element = document.getElementsByClassName("guess-map_canvas__cvpqv")[0];
                const keys = Object.keys(element);
                const key = keys.find(key => key.startsWith("__reactFiber$"));
                const props = element[key];
                const x = props.return.return.memoizedProps.map.__e3_.click;
                const y = Object.keys(x)[0];
                const z = {
                    latLng: {
                        lat: () => lat,
                        lng: () => lng
                    }
                };
                const xy = x[y];
                const a = Object.keys(x[y]);
                for(let i = 0; i < a.length; i++) {
                    let q = a[i];
                    if (typeof xy[q] === "function") {
                        xy[q](z);
                    }
                }
            }, coords);
        } else {
            // Use intercepted coordinates with random offset
            const baseCoords = globalCoordinates;
            
            // Add random offset using min/max distance from settings
            const angle = Math.random() * 2 * Math.PI;
            const distance = currentSettings.minDistance + Math.random() * (currentSettings.maxDistance - currentSettings.minDistance);
            
            const latOffset = (distance / 111111) * Math.cos(angle);
            const lngOffset = (distance / (111111 * Math.cos(baseCoords.lat * Math.PI / 180))) * Math.sin(angle);
            
            const coords = {
                lat: baseCoords.lat + latOffset,
                lng: baseCoords.lng + lngOffset
            };
            
            // Place marker using their method
            await page.evaluate(({lat, lng}) => {
                const element = document.getElementsByClassName("guess-map_canvas__cvpqv")[0];
                const keys = Object.keys(element);
                const key = keys.find(key => key.startsWith("__reactFiber$"));
                const props = element[key];
                const x = props.return.return.memoizedProps.map.__e3_.click;
                const y = Object.keys(x)[0];
                const z = {
                    latLng: {
                        lat: () => lat,
                        lng: () => lng
                    }
                };
                const xy = x[y];
                const a = Object.keys(x[y]);
                for(let i = 0; i < a.length; i++) {
                    let q = a[i];
                    if (typeof xy[q] === "function") {
                        xy[q](z);
                    }
                }
            }, coords);
        }

        // Simulate space key press
        await page.evaluate(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {
                code: 'Space',
                key: ' ',
                keyCode: 32,
                which: 32,
                bubbles: true
            }));
            document.dispatchEvent(new KeyboardEvent('keyup', {
                code: 'Space',
                key: ' ',
                keyCode: 32,
                which: 32,
                bubbles: true
            }));
        });

        // Wait for and click the "Next" button after guess summary
        try {
            await page.waitForSelector('button[data-qa="close-round-result"]', { timeout: 2000 });
            await page.evaluate(() => {
                const nextButton = document.querySelector('button[data-qa="close-round-result"]');
                if (nextButton) nextButton.click();
            });
        } catch {
            try {
                await page.waitForSelector('button:has-text("Next Round")', { timeout: 2000 });
                await page.evaluate(() => {
                    const nextButton = document.querySelector('button:has-text("Next Round")');
                    if (nextButton) nextButton.click();
                });
            } catch {
                // Last round or error, ignore
            }
        }

        return true;
    } catch (e) {
        console.error('Error making guess:', e);
        return false;
    }
}

module.exports = { maps, startGame, makeGuess, getMapsList, updateSettings }; 