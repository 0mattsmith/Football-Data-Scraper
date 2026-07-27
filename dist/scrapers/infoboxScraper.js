"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeWikipediaInfobox = scrapeWikipediaInfobox;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const synonymGenerator_1 = require("./synonymGenerator");
const photoScraper_1 = require("./photoScraper");
/**
 * Scrapes a footballer's career clubs, trophies, nationality, and managers
 * from their Wikipedia biographical infobox and summary text.
 */
async function scrapeWikipediaInfobox(title) {
    const normTitle = title.trim();
    const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(normTitle.replace(/\s+/g, '_'))}`;
    try {
        const res = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'FootballDataScraper/1.0 (https://github.com/0mattsmith/GridBlitz-Trivia; contact@example.com)'
            },
            timeout: 10000
        });
        const $ = cheerio.load(res.data);
        const infobox = $('table.infobox');
        if (!infobox.length) {
            return null;
        }
        // 1. Full name (use clean title to ensure zero CSS/honour corruption)
        const name = normTitle;
        // 2. Nationality (from national team or birth place)
        let nationality = 'England';
        const natText = infobox.text();
        const commonNations = ['England', 'Brazil', 'France', 'Spain', 'Argentina', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Belgium', 'Croatia', 'Uruguay', 'Wales', 'Scotland', 'Ireland', 'Denmark', 'Sweden', 'Norway', 'Colombia', 'Chile', 'South Korea', 'Japan', 'United States'];
        for (const n of commonNations) {
            if (natText.includes(n)) {
                nationality = n;
                break;
            }
        }
        // 3. Extract Clubs from Infobox rows
        const clubsSet = new Set();
        infobox.find('tr').each((_, tr) => {
            const thText = $(tr).find('th').text().toLowerCase();
            const td = $(tr).find('td');
            // If row has club links or is in career section
            td.find('a').each((_, a) => {
                const clubName = $(a).text().trim();
                if (clubName && clubName.length > 2 && !clubName.includes(' ') === false && !clubName.includes('national') && !clubName.includes('team') && !clubName.includes('born')) {
                    // Normalize common club display names
                    clubsSet.add(clubName);
                }
            });
        });
        // Also parse paragraph text for major clubs if infobox was abbreviated
        const summaryText = $('#mw-content-text p').slice(0, 5).text();
        const majorClubs = [
            'Manchester United', 'Tottenham Hotspur', 'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City',
            'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Bayern Munich', 'Borussia Dortmund',
            'Juventus', 'AC Milan', 'Inter Milan', 'PSG', 'Paris Saint-Germain', 'Ajax', 'PSV Eindhoven',
            'West Ham United', 'Nottingham Forest', 'Millwall', 'Portsmouth', 'Leeds United', 'Newcastle United',
            'Everton', 'Aston Villa', 'Celtic', 'Rangers'
        ];
        for (const mc of majorClubs) {
            if (summaryText.includes(mc) || infobox.text().includes(mc)) {
                clubsSet.add(mc);
            }
        }
        // Add common aliases for clubs
        const clubsArray = Array.from(clubsSet);
        if (clubsArray.some(c => c.includes('Tottenham'))) {
            if (!clubsArray.includes('Tottenham Hotspur'))
                clubsArray.push('Tottenham Hotspur');
            if (!clubsArray.includes('Spurs'))
                clubsArray.push('Spurs');
        }
        if (clubsArray.some(c => c.includes('Manchester United') || c.includes('Man Utd'))) {
            if (!clubsArray.includes('Manchester United'))
                clubsArray.push('Manchester United');
        }
        // 4. Extract Trophies / Honours
        const trophiesSet = new Set();
        const fullPageText = $('#mw-content-text').text();
        const majorTrophies = [
            'World Cup', 'Champions League', 'European Cup', 'Premier League', 'FA Cup', 'League Cup',
            'Ballon d\'Or', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Eredivisie', 'Copa America',
            'Euros', 'UEFA Cup', 'Europa League', 'FIFA Club World Cup', 'Intercontinental Cup'
        ];
        for (const t of majorTrophies) {
            if (fullPageText.includes(t)) {
                trophiesSet.add(t);
            }
        }
        const synonyms = (0, synonymGenerator_1.generateSynonyms)(name);
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        // 5. Scrape canonical generic faceshot photo
        const photoResult = await (0, photoScraper_1.scrapePlayerPhoto)(name, res.data);
        return {
            id,
            name,
            synonyms,
            nationality,
            clubs: clubsArray,
            managers: [],
            trophies: Array.from(trophiesSet),
            leagues: ['Premier League'],
            partners: [],
            photoUrl: photoResult?.photoUrl,
            thumbnailUrl: photoResult?.thumbnailUrl,
            wikiUrl: url,
            lastScrapedAt: new Date().toISOString()
        };
    }
    catch (err) {
        console.warn(`[WikipediaScraper] Could not scrape "${title}": ${err.message}`);
        return null;
    }
}
