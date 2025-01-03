const { ipcRenderer } = require('electron');
const maps = require('../maps').maps;
const fs = require('fs');
const path = require('path');

let selectedMap = null;
let hasShownLevel = false;

// Sort and format maps
const sortedMaps = Object.entries(maps).map(([id, data]) => ({
    id,
    name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    hasFixedCoords: !!data.fixedCoords
})).sort((a, b) => a.name.localeCompare(b.name));

// Elements
const mapList = document.getElementById('mapList');
const statusContainer = document.getElementById('statusContainer');
const statusText = document.getElementById('statusText');
const gamesCount = document.getElementById('gamesCount');
const totalXP = document.getElementById('totalXP');
const currentLevel = document.getElementById('currentLevel');
const levelProgress = document.getElementById('levelProgress');
const levelProgressBar = document.getElementById('levelProgressBar');

// Add this function to get country code from map name
function getCountryCode(mapName) {
    const countryMap = {
        'world': 'WW',
        'united states': 'US',
        'usa': 'US',
        'us': 'US',
        'united kingdom': 'UK',
        'uk': 'UK',
        'russia': 'RU',
        'japan': 'JP',
        'brazil': 'BR',
        'australia': 'AU',
        'canada': 'CA',
        'mexico': 'MX',
        'india': 'IN',
        'france': 'FR',
        'germany': 'DE',
        'italy': 'IT',
        'spain': 'ES',
        'netherlands': 'NL',
        'belgium': 'BE',
        'switzerland': 'CH',
        'austria': 'AT',
        'poland': 'PL',
        'sweden': 'SE',
        'norway': 'NO',
        'denmark': 'DK',
        'finland': 'FI',
        'iceland': 'IS',
        'ireland': 'IE',
        'portugal': 'PT',
        'greece': 'GR',
        'turkey': 'TR',
        'israel': 'IL',
        'south africa': 'ZA',
        'china': 'CN',
        'south korea': 'KR',
        'indonesia': 'ID',
        'thailand': 'TH',
        'vietnam': 'VN',
        'philippines': 'PH',
        'malaysia': 'MY',
        'singapore': 'SG',
        'new zealand': 'NZ',
        'argentina': 'AR',
        'bolivia': 'BO',
        'brazil': 'BR',
        'chile': 'CL',
        'colombia': 'CO',
        'ecuador': 'EC',
        'peru': 'PE',
        'uruguay': 'UY',
        'europe': 'EU',
        'asia': 'ASIA',
        'africa': 'AFR',
        'north america': 'NA',
        'south america': 'SA',
        'oceania': 'OCE',
        'famous places': 'FP',
        'botswana': 'BW',
        'eswatini': 'SZ',
        'ghana': 'GH',
        'kenya': 'KE',
        'lesotho': 'LS',
        'madagascar': 'MG',
        'nigeria': 'NG',
        'rwanda': 'RW',
        'senegal': 'SN',
        'sao tome and principe': 'ST',
        'tunisia': 'TN',
        'uganda': 'UG',
        'curacao': 'CW',
        'dominican republic': 'DO',
        'greenland': 'GL',
        'guatemala': 'GT',
        'panama': 'PA',
        'puerto rico': 'PR',
        'us virgin islands': 'VI',
        'netherlands': 'NL',
        'albania': 'AL',
        'andorra': 'AD',
        'austria': 'AT',
        'belgium': 'BE',
        'bulgaria': 'BG',
        'croatia': 'HR',
        'czech_republic': 'CZ',
        'denmark': 'DK',
        'estonia': 'EE',
        'faroe_islands': 'FO',
        'finland': 'FI',
        'france': 'FR',
        'germany': 'DE',
        'italy': 'IT',
        'jersey': 'JE',
        'latvia': 'LV',
        'liechtenstein': 'LI',
        'lithuania': 'LT',
        'luxembourg': 'LU',
        'malta': 'MT',
        'monaco': 'MC',
        'montenegro': 'ME',
        'north_macedonia': 'MK',
        'norway': 'NO',
        'poland': 'PL',
        'portugal': 'PT',
        'romania': 'RO',
        'san_marino': 'SM',
        'serbia': 'RS',
        'slovakia': 'SK',
        'slovenia': 'SI',
        'spain': 'ES',
        'sweden': 'SE',
        'switzerland': 'CH',
        'turkey': 'TR',
        'ukraine': 'UA',
        'united_kingdom': 'GB',
        'bangladesh': 'BD',
        'bhutan': 'BT',
        'cambodia': 'KH',
        'hong_kong': 'HK',
        'india': 'IN',
        'indonesia': 'ID',
        'israel': 'IL',
        'japan': 'JP',
        'jordan': 'JO',
        'kazakhstan': 'KZ',
        'kyrgyzstan': 'KG',
        'laos': 'LA',
        'lebanon': 'LB',
        'malaysia': 'MY',
        'mongolia': 'MN',
        'oman': 'OM',
        'philippines': 'PH',
        'qatar': 'QA',
        'russia': 'RU',
        'singapore': 'SG',
        'south_korea': 'KR',
        'sri_lanka': 'LK',
        'taiwan': 'TW',
        'thailand': 'TH',
        'united_arab_emirates': 'AE',
        'american_samoa': 'AS',
        'australia': 'AU',
        'guam': 'GU',
        'new_zealand': 'NZ',
        'northern_mariana_islands': 'MP',
        'christmas_island': 'CX',
        'gibraltar': 'GI',
        'greece': 'GR',
        'hungary': 'HU',
        'iceland': 'IS',
        'ireland': 'IE',
        'isle_of_man': 'IM',
        'sao_tome_and_principe': 'ST',
        'united_arab_emirates': 'AE'
    };
    
    const lowercaseMap = mapName.toLowerCase();
    for (const [key, code] of Object.entries(countryMap)) {
        if (lowercaseMap.includes(key)) {
            return code;
        }
    }
    
    return 'WW'; // Default to WW (World) if no match
}

function getFlagEmoji(countryCode) {
    // For non-standard cases
    if (countryCode === 'world') return '🌎';
    if (countryCode === 'eu') return '🇪🇺';
    
    // Convert country code to flag emoji
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
}

// Update the map list population
function populateMapList(maps = sortedMaps) {
    mapList.innerHTML = '';
    
    const mapImages = {
        'world': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/3f950f0318b9086b1b9ec591206dfdd8.jpg',
        'asia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/e4f84cb2913aeb8d1af4e647c75caf87.jpg',
        'europe': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/51cf13d662eab22f95156407e3c7e470.jpg',
        'africa': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f41ede13f19fadba4c29f4853cef2390.jpg',
        'north_america': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/1257f892f7e2c2a47d874b2484963314.jpg',
        'south_america': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/64567afd958e7322afd7ef14ff4a7db4.jpg',
        'oceania': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/906807ecfeaba9cbb499780fb28f635c.jpg',
        'usa': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/d908c91fbd846ad9181d0083eac1e236.jpg',
        'japan': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/d61a7e9974cb670ed4846428f2961e2d.jpg',
        'brazil': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/faf1e9514a73797c9d4aee133973399f.jpg',
        'australia': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/90bc27fc05abbea1900694d39e5f6779.jpg',
        'canada': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/01bfaac933cbc42417bcb1e52005455b.jpg',
        'france': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/a0c2d083002ab8968d3c80740f8a5b76.jpg',
        'germany': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/d8088c4207562b41226c7e9f2a99c891.jpg',
        'italy': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/f076fb8de8976e9fdf8f4dc90645e428.jpg',
        'spain': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/f72264478533a80f39f1aa40fe817585.jpg',
        'uk': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/33519c07b513f9348cdcae06637ccdd2.jpg',
        'russia': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/662b32928d69a9f75b6e6b9305f3693f.jpg',
        'netherlands': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/19c0424194468887ca7acb1c7b5c2a96.jpg',
        'turkey': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/45694e550b656e831f10b7d850d613a3.jpg',
        'south_america': 'https://www.geoguessr.com/images/resize:auto:384/gravity:ce/plain/map/64567afd958e7322afd7ef14ff4a7db4.jpg',
        'north_america': 'https://www.geoguessr.com/images/resize:auto:384/gravity:ce/plain/map/1257f892f7e2c2a47d874b2484963314.jpg',
        'famous_places': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/4f62ae62b9e18d8dd6ccc368d15c79bd.jpg',
        'india': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/india.jpg',
        'mexico': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/4a1579542fc4488df3b4f49acf74224a.jpg',
        'china': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/china.jpg',
        'south_korea': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/south-korea.jpg',
        'indonesia': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/indonesia.jpg',
        'thailand': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/thailand.jpg',
        'vietnam': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/vietnam.jpg',
        'philippines': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/philippines.jpg',
        'malaysia': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/malaysia.jpg',
        'singapore': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/singapore.jpg',
        'new_zealand': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/new-zealand.jpg',
        'botswana': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/d2f2623f17167fdaf2293ffff1f07b31.jpg',
        'eswatini': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/7fd1a831dc47ea2b9a162dbf9f4d13f2.jpg',
        'ghana': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/8c0342114a50768b7125a9014c6b6c6d.jpg',
        'kenya': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/43abad33386a5202d72c84c2df298b66.jpg',
        'lesotho': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/81e34d4f2761f8f80644cc5786629007.jpg',
        'madagascar': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/c528fbd1145c00c98933cd9e9c4e64eb.jpg',
        'nigeria': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/3bf28cc16584e61527d2c50017670845.jpg',
        'rwanda': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/f9b1b655dd67b39317ab0be819914933.jpg',
        'senegal': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/035e344720e69d619b045ed3fd993458.jpg',
        'south_africa': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/0a11af9de0067cc38a6ae75e982404b2.jpg',
        'sao_tome_and_principe': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/5203652ca2bb2ca9a1f1b1754860c29a.jpg',
        'tunisia': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/067b4b4dea1df3b20e16a8e41e1d1bc8.jpg',
        'uganda': 'https://www.geoguessr.com/images/resize:auto:336/gravity:ce/plain/map/0b526c98a4ba14006d563bb0ed0072f6.jpg',
        'curacao': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/4f95170a6f4ca7e86ebf656206d5f1cd.jpg',
        'dominican_republic': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/ae6b233b478236755cc7612ae17c068c.jpg',
        'greenland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/d73e3cbb15cab5215af34d39d79d1983.jpg',
        'guatemala': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/4db6890ad8f08dfe072561b120399a17.jpg',
        'panama': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/7bf83e70f25b48a8d8632f4c8bd7a182.jpg',
        'puerto_rico': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/bb4b5ca8b9cb319dc4856d3840ccdeeb.jpg',
        'us_virgin_islands': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/ab788c8dc74eb13612dc213eb11b186c.jpg',
        'argentina': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/12236212f5a577da0e6c6ddf3d468d3f.jpg',
        'bolivia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/c8192b74e022f46ec1d4c35456c9f1cb.jpg',
        'chile': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/3083cecc5074b4b209596d5b7f636e7c.jpg',
        'colombia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/54134ecb612e3695f7206f483cd25c90.jpg',
        'ecuador': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/4a9de6eebfe3388e54fd93ec8cb2c20c.jpg',
        'peru': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a460d6fb318196a14f185af475c997fb.jpg',
        'uruguay': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/cfe2fc13294d9d43690ea31938a6fbbf.jpg',
        'netherlands': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/19c0424194468887ca7acb1c7b5c2a96.jpg',
        'albania': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/bb24ca9bf44b04d8690fe670905975f8.jpg',
        'andorra': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/b1f3d579319819acfcbff3664f1b995d.jpg',
        'austria': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f35c41a3b2a1266b227fa5eee1c04fa8.jpg',
        'belgium': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/2b1a2685372e41fdb382f67c2228ecf5.jpg',
        'bulgaria': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/02c2f20fbc270e8616861463b6a1303c.jpg',
        'croatia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/065790ba9850d1c91548d8518b4fc2cb.jpg',
        'czech_republic': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/c517cf345c96042255e9054ff4da0f7d.jpg',
        'denmark': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/7b89c16ee8a7eec178ae7ad542114ea0.jpg',
        'estonia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/bf0298c21ba8173c5cb6b207d82c4e4d.jpg',
        'faroe_islands': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/80edd70513e95265335e23f11237547d.jpg',
        'finland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f4e9e7a8c6f7eb62ca8f63de7abfb14f.jpg',
        'france': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a0c2d083002ab8968d3c80740f8a5b76.jpg',
        'germany': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/d8088c4207562b41226c7e9f2a99c891.jpg',
        'italy': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f076fb8de8976e9fdf8f4dc90645e428.jpg',
        'jersey': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/b0280218dccc3a84a7a2cf5d1d85d990.jpg',
        'latvia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/fda533fbf99d10f34444bd8747c9a75c.jpg',
        'liechtenstein': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a5da92bbf3fe609d24f517c07d00d194.jpg',
        'lithuania': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a28d83385d69a6f1d6e0786bd4ceca83.jpg',
        'luxembourg': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/61ac2fa13549c2b1e7d3ec61d5c19fc2.jpg',
        'malta': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/bfeeb86f95583f8e19a138521b10a7a7.jpg',
        'monaco': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/3360a9d09c18a8371c6c9abed5926d0a.jpg',
        'montenegro': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/523a46bac2aed0c9e868eba2673ec7b4.jpg',
        'north_macedonia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/85ac93fde4169607abf23ace04e170b8.jpg',
        'norway': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/8b866e1371ec9642d8eda6e7da5d7f65.jpg',
        'poland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/2bb1d8a7f54727f421f0b7844b764f8a.jpg',
        'portugal': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a0e2c6893e3d10be5440021026f275a5.jpg',
        'romania': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/c0cd2034f8dcb4cb931023cfcf4b7a7a.jpg',
        'san_marino': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/cf3ad5494aa7b6cadd7cb1ad04969328.jpg',
        'serbia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/09a7ff082e126e215d37eb149de8ec0b.jpg',
        'slovakia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/9896a1d59049c0d04c29446a2f3daf57.jpg',
        'slovenia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/9b2271aa0c30553f383181760b5193ec.jpg',
        'spain': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f72264478533a80f39f1aa40fe817585.jpg',
        'sweden': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/cee65b362c1f6ab6db3f27fe077cb125.jpg',
        'switzerland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/c7a213a341c0049fa224d630fc0e9543.jpg',
        'turkey': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/45694e550b656e831f10b7d850d613a3.jpg',
        'ukraine': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f24f2a0724172b86f4fcd2d172cac268.jpg',
        'united_kingdom': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/33519c07b513f9348cdcae06637ccdd2.jpg',
        'bangladesh': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/2aa6b912593eea4a1b4c2ec8aea9b920.jpg',
        'bhutan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/2404261742e98967015f7f6e94d241fc.jpg',
        'cambodia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/159f29847052ddc1c930af476ee52b82.jpg',
        'hong_kong': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/31e60713f490103dce0a8e3d5f9fb986.jpg',
        'india': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/5227989f23f8a86f605fd0dc91df0604.jpg',
        'indonesia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/e4c266bc28b9566abae0ba29d397e602.jpg',
        'israel': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/7fef6508297c6057799a325b87e6d2cf.jpg',
        'japan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/d61a7e9974cb670ed4846428f2961e2d.jpg',
        'jordan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/88fc0dddca673ab811a4c6c179a997f2.jpg',
        'kazakhstan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/e4a5cc900e8f21da640ffc60d52cf6c8.jpg',
        'kyrgyzstan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/837343fbd50aa474922720f168652f9e.jpg',
        'laos': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/b1b8e425531c4a9ddf71193031df2297.jpg',
        'lebanon': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/8557c9b4d1e5bfe6b9d78b1d86cdccca.jpg',
        'malaysia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/d9db67c2c623d4f4e5207cb50e84f7e4.jpg',
        'mongolia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/1cf6352d3246313be2241b412c19c02a.jpg',
        'oman': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/769bfca61bf0b4ad491dbdf37ba0ec2a.jpg',
        'philippines': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/27798c373f3a64306120af192839e280.jpg',
        'qatar': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/6a1cd8dda732a016f732c067bffc8a45.jpg',
        'russia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/662b32928d69a9f75b6e6b9305f3693f.jpg',
        'singapore': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/e24e47a5b42a77e7dd3f0e82959d2bbc.jpg',
        'south_korea': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/e456290492cf650ff8a666a094319913.jpg',
        'sri_lanka': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/ff278d6e7c6a02ee7261fa439332a2c5.jpg',
        'taiwan': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/9600f3b2a8f06e38fa117befdae9c9e0.jpg',
        'thailand': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/9a4b94f8ad7c6dfc94fc5e78dbe54f06.jpg',
        'american_samoa': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/391b670641acccc6697d44191aa656d4.jpg',
        'australia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/90bc27fc05abbea1900694d39e5f6779.jpg',
        'guam': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/b1599950d936fa067ef129eae2c724e0.jpg',
        'new_zealand': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/57c8375836c63269da5ea7c559b84143.jpg',
        'northern_mariana': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/bbf779b95e5c273d1efb4115ff63df1d.jpg',
        'christmas_island': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/37cb872351f0337d3e01b60d91a4de0a.jpg',
        'gibraltar': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/3a54b9f4e1e592a7fdef62b5ad82b750.jpg',
        'greece': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/8ee99b7538050f0ccc6d57ce6bd7b0f6.jpg',
        'hungary': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f35c41a3b2a1266b227fa5eee1c04fa8.jpg',
        'iceland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/f4e9e7a8c6f7eb62ca8f63de7abfb14f.jpg',
        'ireland': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/94a17d49acf25c4e2ea87122d5461e84.jpg',
        'isle_of_man': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/a025991e891673684477205809278a04.jpg',
        'north_macedonia': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/85ac93fde4169607abf23ace04e170b8.jpg',
        'sao_tome': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/5203652ca2bb2ca9a1f1b1754860c29a.jpg',
        'uae': 'https://www.geoguessr.com/images/resize:auto:528:264/gravity:ce/plain/map/abe3fdcfb1b2b2ace036e7b0604f1cce.jpg'
    };

    maps.forEach((map) => {
        const div = document.createElement('div');
        div.className = 'map-item';
        
        const mapId = map.id.toLowerCase().replace(/\s+/g, '_');
        const mapImage = mapImages[mapId] || mapImages['world'];
        div.style.setProperty('background-image', `url(${mapImage})`);
        
        div.innerHTML = `
            <span class="map-name">${map.name}</span>
        `;
        
        div.addEventListener('click', () => {
            document.querySelector('.map-item.selected')?.classList.remove('selected');
            div.classList.add('selected');
            
            // Get the map ID from the original maps object
            const mapId = map.id.toLowerCase().replace(/[^a-z0-9]/g, '_'); // Convert spaces and special chars to underscores
            selectedMap = mapId;
            
            ipcRenderer.send('stop-bot');
            
            setTimeout(() => {
                console.log('Sending map ID:', mapId); // Debug log
                ipcRenderer.send('map-selected', mapId);
                document.querySelector('[data-tab="dashboard"]').click();
            }, 500);
        });
        
        mapList.appendChild(div);
    });
}

// Add search functionality
const searchInput = document.getElementById('mapSearch');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredMaps = sortedMaps.filter(map => 
        map.name.toLowerCase().includes(searchTerm)
    );
    populateMapList(filteredMaps);
});

// Initial population
populateMapList();

function addLogLine(message, type = 'info') {
    const logContainer = document.getElementById('statusText');
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.textContent = message;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Handle bot updates
ipcRenderer.on('bot-update', (_, message) => {
    // Check message type and apply appropriate color
    if (message.match(/^\[\d+\] \d+XP ->/)) {
        // Game completion messages
        addLogLine(message, 'success');
    }
    else if (message.includes('Bot runner started') || message.includes('Browser connected')) {
        addLogLine(message, 'system');
    }
    else if (message.includes('Game stuck')) {
        addLogLine(message, 'warning');
    }
    else if (message.includes('Error') || message.includes('error')) {
        addLogLine(message, 'error');
    }
    else if (message.includes('stuck') || message.includes('waiting')) {
        addLogLine(message, 'warning');
    }
    else if (message.includes('Logged in') || message.includes('Selected map')) {
        addLogLine(message, 'success');
    }
    else {
        addLogLine(message, 'info');
    }

    // Update stats from game completion messages
    const gameMatch = message.match(/^\[(\d+)\] (\d+)XP/);
    if (gameMatch) {
        gamesCount.textContent = gameMatch[1];
        const xpGained = parseInt(gameMatch[2]);
        totalXP.textContent = (parseInt(totalXP.textContent || '0') + xpGained).toString();
        
        // Update level info
        const levelMatch = message.match(/Level (\d+) \((\d+) \/ (\d+)\)/);
        if (levelMatch) {
            const [_, level, current, max] = levelMatch;
            const levelElement = document.querySelector('#currentLevel');
            const levelNumber = levelElement.querySelector('.level-number');
            const levelTier = levelElement.querySelector('.level-tier');
            const levelNav = document.querySelector('.level-progress-nav');
            
            // Show level nav if this is the first time
            if (!hasShownLevel) {
                hasShownLevel = true;
                levelNav.classList.add('has-data');
            }
            
            const tierClass = getTierClass(parseInt(level));
            
            levelNumber.textContent = level;
            levelTier.className = 'level-tier ' + tierClass;
            levelProgress.textContent = `${current} / ${max}`;
            levelProgressBar.style.width = `${(current / max) * 100}%`;
        }
    }
});

ipcRenderer.on('bot-error', (_, message) => {
    addLogLine(`Error: ${message}`, 'error');
});

ipcRenderer.on('bot-stopped', () => {
    addLogLine('Bot stopped.', 'system');
});

// Tab switching logic
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items and tabs
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked item and corresponding tab
        item.classList.add('active');
        const tabId = item.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Update settings object
const settings = {
    email: '',
    password: '',
    useFixedCoords: false,
    minDistance: 5000,
    maxDistance: 200000
};

// Update settings file path
const settingsPath = path.join(__dirname, '../../settings.json');

// Load settings from file
function loadSettings() {
    try {
        if (fs.existsSync(settingsPath)) {
            const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
            Object.assign(settings, savedSettings);
            
            // Update UI
            document.getElementById('email').value = settings.email;
            document.getElementById('password').value = settings.password;
            document.getElementById('useFixedCoords').checked = settings.useFixedCoords;
            document.getElementById('minDistance').value = settings.minDistance;
            document.getElementById('maxDistance').value = settings.maxDistance;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Save settings to file
function saveSettings() {
    try {
        const settings = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            useFixedCoords: document.getElementById('useFixedCoords').checked,
            minDistance: parseInt(document.getElementById('minDistance').value),
            maxDistance: parseInt(document.getElementById('maxDistance').value)
        };
        
        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
        ipcRenderer.send('settings-updated', settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
}

// Add event listeners to settings controls
document.querySelectorAll('.setting-control').forEach(control => {
    control.addEventListener('change', saveSettings);
});

// Load settings on startup
loadSettings();

// Add delete session handler
document.getElementById('deleteSession').addEventListener('click', () => {
    try {
        const sessionPath = path.join(__dirname, '../../session.json');
        if (fs.existsSync(sessionPath)) {
            fs.unlinkSync(sessionPath);
            addLogLine('Session data deleted successfully', 'success');
        } else {
            addLogLine('No session data found', 'info');
        }
    } catch (error) {
        addLogLine('Error deleting session: ' + error.message, 'error');
    }
});

// Add this function to determine tier based on level
function getTierClass(level) {
    // Calculate tier based on level ranges (0-9 = tier 10, 10-19 = tier 20, etc.)
    const tierLevel = Math.ceil(level / 10) * 10;
    const tierClass = `tier-${tierLevel}`;
    console.log(`Level ${level} -> Tier ${tierLevel} -> Class ${tierClass}`);
    return tierClass;
} 