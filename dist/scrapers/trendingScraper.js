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
exports.TRENDING_WONDERKIDS = void 0;
exports.discoverTrendingPlayers = discoverTrendingPlayers;
exports.scrapeTrendingEra = scrapeTrendingEra;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const infoboxScraper_1 = require("./infoboxScraper");
/**
 * Seed list of breakthrough young stars, wonderkids, and latest transfers
 * representing the "newest of the new" across world football.
 */
exports.TRENDING_WONDERKIDS = [
    'Lamine Yamal',
    'Kobbie Mainoo',
    'Endrick',
    'Estêvão Willian',
    'Cole Palmer',
    'Alejandro Garnacho',
    'Pau Cubarsí',
    'Arda Güler',
    'Adam Wharton',
    'Archie Gray',
    'Michael Olise',
    'Florian Wirtz',
    'Jamal Musiala',
    'Savinho',
    'Warren Zaïre-Emery',
    'Leny Yoro',
    'Joshua Zirkzee',
    'Viktor Gyökeres',
    'Riccardo Calafiori',
    'Ethan Nwaneri',
    'Conor Bradley',
    'Jarell Quansah',
    'Lewis Hall',
    'Dominic Solanke',
    'Dominik Szoboszlai',
    'Jérémy Doku',
    'Joško Gvardiol',
    'Kenan Yıldız',
    'Nico Williams',
    'Dani Olmo'
];
/**
 * Dynamically crawls Wikipedia's Golden Boy Award and Premier League Breakout lists
 * to discover newly trending young footballers, merging them with our curated wonderkid seed list.
 */
async function discoverTrendingPlayers() {
    const discovered = new Set(exports.TRENDING_WONDERKIDS);
    try {
        // Crawl Wikipedia Golden Boy (award) page for recent nominees and winners
        const url = 'https://en.wikipedia.org/wiki/Golden_Boy_(award)';
        const res = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'FootballDataScraper/1.0 (https://github.com/0mattsmith/GridBlitz-Trivia; contact@example.com)'
            },
            timeout: 10000
        });
        const $ = cheerio.load(res.data);
        $('table.wikitable tr').each((_, tr) => {
            const td = $(tr).find('td');
            td.find('a').each((_, a) => {
                const text = $(a).text().trim();
                // Keep valid player full names, excluding clubs, countries, and awards
                const excludedTerms = [
                    'Award', 'FC', 'United', 'Madrid', 'Milan', 'City', 'Dortmund', 'Munich',
                    'Germain', 'Barcelona', 'Arsenal', 'Chelsea', 'Liverpool', 'Atlético',
                    'Hotspur', 'Everton', 'Villa', 'Forest', 'England', 'Spain', 'France',
                    'Germany', 'Italy', 'Brazil', 'Argentina', 'Portugal', 'Netherlands',
                    'Trophy', 'Season', 'League', 'Cup', 'Final'
                ];
                const isValidPlayer = text &&
                    text.includes(' ') &&
                    text.length > 5 &&
                    !excludedTerms.some(term => text.toLowerCase().includes(term.toLowerCase()));
                if (isValidPlayer) {
                    discovered.add(text);
                }
            });
        });
    }
    catch (err) {
        console.warn(`[TrendingScraper] Could not crawl dynamic Golden Boy table: ${err.message}. Using curated wonderkid seed.`);
    }
    return Array.from(discovered);
}
/**
 * Scrapes enriched profiles for all trending wonderkids and newest players.
 */
async function scrapeTrendingEra() {
    console.log(`[TrendingScraper] Discovering newest breakout stars and wonderkids...`);
    const names = await discoverTrendingPlayers();
    console.log(`[TrendingScraper] Found ${names.length} trending players to scrape.`);
    const profiles = [];
    for (const name of names) {
        console.log(`   -> Scraping trending profile: ${name}...`);
        const p = await (0, infoboxScraper_1.scrapeWikipediaInfobox)(name);
        if (p) {
            profiles.push(p);
        }
    }
    return profiles;
}
