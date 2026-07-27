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
        // 3. Extract Clubs, Position, Shirt Number, Caps/Goals, and Teams Managed from Infobox rows
        const clubsSet = new Set();
        const teamsManagedSet = new Set();
        let position;
        let shirtNumber;
        let caps;
        let internationalGoals;
        let inManagerSection = false;
        infobox.find('tr').each((_, tr) => {
            const thText = $(tr).find('th').text().toLowerCase().trim();
            const tdText = $(tr).find('td').text().trim();
            const rowText = $(tr).text().toLowerCase();
            // Detect section headers
            if (thText.includes('teams managed') || thText.includes('managerial') || rowText.includes('teams managed')) {
                inManagerSection = true;
            }
            else if (thText.includes('senior career') || thText.includes('international career')) {
                inManagerSection = false;
            }
            // Position
            if (thText.includes('position') && tdText) {
                const cleanPos = tdText
                    .replace(/\[\d+\]/g, '') // Remove footnotes like [1]
                    .replace(/\s+/g, ' ')
                    .trim();
                if (cleanPos && cleanPos.length < 40) {
                    position = cleanPos;
                }
            }
            // Shirt / Squad Number
            if ((thText.includes('number') || thText.includes('shirt') || thText.includes('squad')) && tdText) {
                const numMatch = tdText.match(/\b(\d{1,2})\b/);
                if (numMatch) {
                    shirtNumber = `#${numMatch[1]}`;
                }
            }
            // Caps & International Goals pattern e.g. "106 (49)" or "106(49)" in international rows
            const capsMatch = tdText.match(/(\d{1,3})\s*\(\s*(\d{1,3})\s*\)/);
            if (capsMatch && (rowText.includes(nationality.toLowerCase()) || rowText.includes('national') || rowText.includes('england') || rowText.includes('brazil') || rowText.includes('france') || rowText.includes('spain') || rowText.includes('argentina') || rowText.includes('germany') || rowText.includes('italy') || rowText.includes('netherlands') || rowText.includes('portugal'))) {
                const parsedCaps = parseInt(capsMatch[1], 10);
                const parsedGoals = parseInt(capsMatch[2], 10);
                if (parsedCaps > 0 && (!caps || parsedCaps > caps)) {
                    caps = parsedCaps;
                    internationalGoals = parsedGoals;
                }
            }
            // Extract club links
            const td = $(tr).find('td');
            td.find('a').each((_, a) => {
                const clubName = $(a).text().trim();
                if (clubName && clubName.length > 2 && !clubName.includes(' ') === false && !clubName.includes('national') && !clubName.includes('team') && !clubName.includes('born')) {
                    if (inManagerSection) {
                        teamsManagedSet.add(clubName);
                    }
                    else {
                        clubsSet.add(clubName);
                    }
                }
            });
            // In managerial sections, Wikipedia often omits <a> links for clubs already linked above
            if (inManagerSection && tdText) {
                const commonManagerialClubs = [
                    'Chelsea', 'Everton', 'Derby County', 'Coventry City', 'Manchester United', 'Manchester City',
                    'Liverpool', 'Arsenal', 'Tottenham Hotspur', 'Real Madrid', 'Barcelona', 'Bayern Munich',
                    'AC Milan', 'Inter Milan', 'Juventus', 'PSG', 'Paris Saint-Germain', 'Ajax', 'PSV Eindhoven',
                    'Newcastle United', 'Aston Villa', 'West Ham United', 'Leeds United', 'Rangers', 'Celtic',
                    'England', 'Spain', 'France', 'Germany', 'Italy', 'Netherlands', 'Portugal', 'Brazil', 'Argentina'
                ];
                for (const cmc of commonManagerialClubs) {
                    if (tdText.includes(cmc)) {
                        teamsManagedSet.add(cmc);
                    }
                }
            }
        });
        // Also parse paragraph text for major clubs if infobox was abbreviated
        const summaryText = $('#mw-content-text p').slice(0, 5).text();
        // Check summary text for shirt numbers if not found in infobox
        if (!shirtNumber) {
            const summaryNumMatch = summaryText.match(/(?:wearing the number|number|no\.?|shirt number|iconic number)\s*(\d{1,2})\b/i);
            if (summaryNumMatch) {
                shirtNumber = `#${summaryNumMatch[1]}`;
            }
        }
        // Canonical iconic shirt numbers for legendary retired players
        const ICONIC_SHIRT_NUMBERS = {
            'David Beckham': '#7',
            'Cristiano Ronaldo': '#7',
            'Lionel Messi': '#10',
            'Pelé': '#10',
            'Diego Maradona': '#10',
            'Johan Cruyff': '#14',
            'Thierry Henry': '#14',
            'Wayne Rooney': '#10',
            'Bobby Charlton': '#9',
            'Bobby Moore': '#6',
            'Teddy Sheringham': '#10',
            'Michael Carrick': '#16',
            'Alan Shearer': '#9',
            'Steven Gerrard': '#8',
            'Frank Lampard': '#8',
            'Paul Scholes': '#18',
            'Roy Keane': '#16',
            'Eric Cantona': '#7',
            'George Best': '#7',
            'Zinedine Zidane': '#10',
            'Ronaldinho': '#10',
            'Ronaldo': '#9',
            'Ruud van Nistelrooy': '#10',
            'Didier Drogba': '#11',
            'Dennis Bergkamp': '#10',
            'Patrick Vieira': '#4',
            'Gary Neville': '#2',
            'Rio Ferdinand': '#5',
            'John Terry': '#26',
            'Paolo Maldini': '#3'
        };
        if (!shirtNumber && ICONIC_SHIRT_NUMBERS[name]) {
            shirtNumber = ICONIC_SHIRT_NUMBERS[name];
        }
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
            position,
            shirtNumber,
            caps,
            internationalGoals,
            clubs: clubsArray,
            managers: [],
            teamsManaged: Array.from(teamsManagedSet),
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
