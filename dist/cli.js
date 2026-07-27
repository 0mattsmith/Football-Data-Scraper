#!/usr/bin/env node
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
const commander_1 = require("commander");
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const wikidataScraper_1 = require("./scrapers/wikidataScraper");
const exportDb_1 = require("./syncer/exportDb");
const firestoreUpsert_1 = require("./syncer/firestoreUpsert");
const program = new commander_1.Command();
program
    .name('football-data-scraper')
    .description('Ever-evolving Footballer Data Scraper & Archive Engine from FA inception (1863) to present day.')
    .version('1.0.0');
program
    .command('scrape')
    .description('Scrape footballer profiles from Wikipedia/Wikidata by era')
    .option('-e, --era <type>', 'Era to scrape: pioneers, postwar, premierleague, modern, all', 'premierleague')
    .option('-s, --sync', 'Sync immediately to Half Time • Football Trivia Arena', true)
    .option('-f, --firestore', 'Upsert results into Firebase Firestore', false)
    .action(async (options) => {
    const era = options.era;
    console.log(`[Scrape] Starting career scrape for era: ${era.toUpperCase()}...`);
    const profiles = await (0, wikidataScraper_1.scrapeEraProfiles)(era);
    console.log(`[Scrape] Completed scraping ${profiles.length} profiles.`);
    const outFile = (0, exportDb_1.exportToLocalDb)(profiles);
    if (options.sync) {
        (0, exportDb_1.syncToHalfTimeTrivia)(profiles);
    }
    if (options.firestore) {
        await (0, firestoreUpsert_1.upsertToFirestore)(profiles);
    }
    console.log(`[Scrape] Done!`);
});
program
    .command('photo <name>')
    .description('Scrape and select the best generic portrait faceshot photo for a footballer')
    .action(async (name) => {
    console.log(`[Photo Scraper] Searching Wikimedia & Infoboxes for best generic faceshot of "${name}"...`);
    const { scrapePlayerPhoto } = await Promise.resolve().then(() => __importStar(require('./scrapers/photoScraper')));
    const result = await scrapePlayerPhoto(name);
    if (result) {
        console.log(`[Photo Scraper] ✅ Selected Iconic Generic Faceshot for ${name}:`);
        console.log(`   Photo URL    : ${result.photoUrl}`);
        console.log(`   Thumbnail    : ${result.thumbnailUrl}`);
        console.log(`   Score        : ${result.score}`);
        console.log(`   Selection    : ${result.reason}`);
    }
    else {
        console.log(`[Photo Scraper] ⚠️ No suitable portrait photo found for "${name}".`);
    }
});
program
    .command('sync')
    .description('Sync existing scraped database directly into Half Time • Football Trivia Arena')
    .action(async () => {
    const distFile = path_1.default.join(__dirname, '../dist/footballer-db.json');
    if (fs_1.default.existsSync(distFile)) {
        const data = JSON.parse(fs_1.default.readFileSync(distFile, 'utf8'));
        (0, exportDb_1.syncToHalfTimeTrivia)(data);
    }
    else {
        console.log(`[Sync] No existing database in dist/. Running a scrape first...`);
        const profiles = await (0, wikidataScraper_1.scrapeEraProfiles)('all');
        (0, exportDb_1.syncToHalfTimeTrivia)(profiles);
    }
});
program
    .command('firestore')
    .description('Upsert local database profiles into Firebase Firestore')
    .action(async () => {
    const distFile = path_1.default.join(__dirname, '../dist/footballer-db.json');
    let profiles = [];
    if (fs_1.default.existsSync(distFile)) {
        profiles = JSON.parse(fs_1.default.readFileSync(distFile, 'utf8'));
    }
    else {
        profiles = await (0, wikidataScraper_1.scrapeEraProfiles)('premierleague');
    }
    await (0, firestoreUpsert_1.upsertToFirestore)(profiles);
});
program
    .command('serve')
    .description('Start lightweight local REST API server for Half Time Trivia queries')
    .option('-p, --port <number>', 'Port number to listen on', '4001')
    .action((options) => {
    const port = parseInt(options.port, 10) || 4001;
    const server = http_1.default.createServer((req, res) => {
        const parsedUrl = url_1.default.parse(req.url || '', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        if (parsedUrl.pathname === '/api/players' || parsedUrl.pathname === '/api/search') {
            const queryName = (parsedUrl.query.q || parsedUrl.query.name || '').toString().toLowerCase();
            const distFile = path_1.default.join(__dirname, '../dist/footballer-db.json');
            let players = [];
            if (fs_1.default.existsSync(distFile)) {
                players = JSON.parse(fs_1.default.readFileSync(distFile, 'utf8'));
            }
            if (queryName) {
                const filtered = players.filter((p) => p.name.toLowerCase().includes(queryName) ||
                    p.synonyms?.some((s) => s.includes(queryName)));
                res.end(JSON.stringify({ count: filtered.length, results: filtered }));
            }
            else {
                res.end(JSON.stringify({ count: players.length, results: players }));
            }
        }
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Not found. Use /api/search?q=name' }));
        }
    });
    server.listen(port, () => {
        console.log(`[Server] Football Data Scraper REST API live on http://localhost:${port}`);
    });
});
program.parse(process.argv);
