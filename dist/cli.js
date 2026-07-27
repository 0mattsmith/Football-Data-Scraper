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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const wikidataScraper_1 = require("./scrapers/wikidataScraper");
const exportDb_1 = require("./syncer/exportDb");
const firestoreUpsert_1 = require("./syncer/firestoreUpsert");
const server_1 = require("./api/server");
const graphScraper_1 = require("./scrapers/graphScraper");
const crawler_1 = require("./scrapers/crawler");
const program = new commander_1.Command();
program
    .name('football-data-scraper')
    .description('Ever-evolving Footballer Data Scraper & Archive Engine from FA inception (1863) to present day.')
    .version('1.0.0');
program
    .command('scrape')
    .description('Scrape footballer profiles from Wikipedia/Wikidata by era')
    .option('-e, --era <type>', 'Era to scrape: pioneers, postwar, premierleague, modern, trending, all', 'premierleague')
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
    .command('info <name>')
    .description('Scrape and display enriched career profile (position, shirt number, caps, teams managed)')
    .action(async (name) => {
    console.log(`[Info Scraper] Extracting enriched Wikipedia infobox data for "${name}"...`);
    const { scrapeWikipediaInfobox } = await Promise.resolve().then(() => __importStar(require('./scrapers/infoboxScraper')));
    const result = await scrapeWikipediaInfobox(name);
    if (result) {
        console.log(`[Info Scraper] ✅ Enriched Profile for ${result.name}:`);
        console.log(`   Nationality    : ${result.nationality}`);
        console.log(`   Position       : ${result.position || 'N/A'}`);
        console.log(`   Shirt Number   : ${result.shirtNumber || 'N/A'}`);
        console.log(`   Intl Caps      : ${result.caps ? `${result.caps} caps (${result.internationalGoals || 0} goals)` : 'N/A'}`);
        console.log(`   Career Clubs   : ${result.clubs.length} clubs (${result.clubs.slice(0, 4).join(', ')}...)`);
        console.log(`   Major Trophies : ${result.trophies.length} trophies`);
        if (result.teamsManaged && result.teamsManaged.length > 0) {
            console.log(`   Teams Managed  : ${result.teamsManaged.join(', ')}`);
        }
    }
    else {
        console.log(`[Info Scraper] ⚠️ Could not extract profile for "${name}".`);
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
    .description('Start REST API server for Half Time Trivia & third-party games with API Key authentication')
    .option('-p, --port <number>', 'Port number to listen on', '3000')
    .option('-k, --api-keys <keys>', 'Comma-separated valid API keys', 'gb_live_demo_key,gb_live_brother_01')
    .action(async (options) => {
    const port = parseInt(options.port, 10) || 3000;
    const apiKeys = (options.apiKeys || '').split(',').map((k) => k.trim()).filter(Boolean);
    const server = new server_1.FootballApiServer(port, apiKeys);
    await server.start();
});
program
    .command('graph [entity] [id]')
    .description('Inspect the Historical Football Knowledge Graph (entity: clubs, stadiums, trophies, nationalteams, all)')
    .action((entity = 'all', id) => {
    const graph = (0, graphScraper_1.buildFootballKnowledgeGraph)();
    const targetEntity = entity.toLowerCase();
    if (targetEntity === 'all') {
        console.log(JSON.stringify(graph, null, 2));
        return;
    }
    const section = graph[targetEntity] || graph[`${targetEntity}s`];
    if (!section) {
        console.error(`Invalid graph entity "${entity}". Valid entities: clubs, stadiums, trophies, nationalteams, all`);
        process.exit(1);
    }
    if (id) {
        const item = section[id.toLowerCase()] || Object.values(section).find((x) => x.id === id.toLowerCase() || x.synonyms?.includes(id.toLowerCase()));
        if (!item) {
            console.error(`ID "${id}" not found in entity "${entity}".`);
            process.exit(1);
        }
        console.log(JSON.stringify(item, null, 2));
    }
    else {
        console.log(JSON.stringify(section, null, 2));
    }
});
program
    .command('crawl [category]')
    .description('Crawl Wikipedia to discover EFL clubs, historic EFL clubs, and stadiums')
    .action(async (category = 'efl') => {
    const result = await (0, crawler_1.crawlKnowledgeGraph)(category);
    console.log(`[Crawl] Result: +${result.addedClubs} Clubs, +${result.addedStadiums} Stadiums.`);
    console.log(`[Crawl] Total Clubs in Knowledge Graph: ${Object.keys(result.graph.clubs).length}`);
    console.log(`[Crawl] Total Stadiums in Knowledge Graph: ${Object.keys(result.graph.stadiums).length}`);
});
program.parse(process.argv);
