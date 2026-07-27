"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballApiServer = void 0;
const http_1 = __importDefault(require("http"));
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const photoScraper_1 = require("../scrapers/photoScraper");
/**
 * Football-Data-Scraper REST API Server with API Key Authentication & CORS.
 * Serves verified footballer profiles, random trivia question generators,
 * and live generic photo / infobox enrichment over HTTP.
 */
class FootballApiServer {
    profiles = [];
    apiKeys;
    port;
    constructor(port = 3000, apiKeys = ['gb_live_demo_key', 'gb_live_brother_01']) {
        this.port = port;
        this.apiKeys = new Set(apiKeys.map(k => k.trim()).filter(Boolean));
        this.loadDatabase();
    }
    loadDatabase() {
        try {
            const dbPath = path_1.default.resolve(__dirname, '../../dist/footballer-db.json');
            if (fs_1.default.existsSync(dbPath)) {
                const raw = fs_1.default.readFileSync(dbPath, 'utf8');
                this.profiles = JSON.parse(raw);
                console.log(`[API Server] Loaded ${this.profiles.length} verified footballer profiles from local database.`);
            }
            else {
                console.warn(`[API Server] Warning: Database not found at ${dbPath}. Run 'npm run scrape:full' first.`);
            }
        }
        catch (err) {
            console.error(`[API Server] Error loading database: ${err.message}`);
        }
    }
    sendJson(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'X-API-Key, Authorization, Content-Type'
        });
        res.end(JSON.stringify(data, null, 2));
    }
    authenticate(req, url) {
        // Check X-API-Key header
        const headerKey = req.headers['x-api-key'];
        if (headerKey && this.apiKeys.has(headerKey))
            return true;
        // Check Authorization: Bearer <key> header
        const authHeader = req.headers['authorization'] || '';
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.slice(7).trim();
            if (this.apiKeys.has(token))
                return true;
        }
        // Check ?apiKey=<key> query param
        const queryKey = url.searchParams.get('apiKey');
        if (queryKey && this.apiKeys.has(queryKey))
            return true;
        return false;
    }
    start() {
        const server = http_1.default.createServer(async (req, res) => {
            // CORS Preflight
            if (req.method === 'OPTIONS') {
                res.writeHead(204, {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'X-API-Key, Authorization, Content-Type'
                });
                res.end();
                return;
            }
            if (req.method !== 'GET') {
                return this.sendJson(res, 405, { error: 'Method Not Allowed', message: 'Only GET requests are supported.' });
            }
            const url = new url_1.URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
            const pathname = url.pathname;
            // Public health check endpoint
            if (pathname === '/v1/health' || pathname === '/health') {
                return this.sendJson(res, 200, {
                    status: 'ok',
                    service: 'Football-Data-Scraper REST API',
                    version: '1.0.3',
                    playersLoaded: this.profiles.length,
                    timestamp: new Date().toISOString()
                });
            }
            // Enforce API Key authentication for all other endpoints
            if (!this.authenticate(req, url)) {
                return this.sendJson(res, 401, {
                    error: 'Unauthorized',
                    message: 'Invalid or missing API Key. Please provide a valid key via "X-API-Key" header or "?apiKey=" query parameter.',
                    example: 'http://localhost:3000/v1/players/random?apiKey=gb_live_demo_key'
                });
            }
            // GET /v1/players -> Return all players (optional era filtering)
            if (pathname === '/v1/players') {
                const eraFilter = url.searchParams.get('era')?.toLowerCase();
                let results = this.profiles;
                if (eraFilter && eraFilter !== 'all') {
                    results = results.filter(p => p.era?.toLowerCase() === eraFilter);
                }
                return this.sendJson(res, 200, {
                    count: results.length,
                    era: eraFilter || 'all',
                    data: results
                });
            }
            // GET /v1/players/random -> Return random player(s) for trivia game
            if (pathname === '/v1/players/random') {
                const eraFilter = url.searchParams.get('era')?.toLowerCase();
                const count = Math.min(Math.max(parseInt(url.searchParams.get('count') || '1', 10), 1), 10);
                let candidates = this.profiles;
                if (eraFilter && eraFilter !== 'all') {
                    candidates = candidates.filter(p => p.era?.toLowerCase() === eraFilter);
                }
                if (candidates.length === 0) {
                    return this.sendJson(res, 404, { error: 'Not Found', message: `No players found for era "${eraFilter}"` });
                }
                // Shuffle & pick
                const shuffled = [...candidates].sort(() => 0.5 - Math.random());
                const selected = shuffled.slice(0, count);
                return this.sendJson(res, 200, count === 1 ? selected[0] : { count: selected.length, data: selected });
            }
            // GET /v1/photo/:name -> Live generic portrait photo scraper
            if (pathname.startsWith('/v1/photo/')) {
                const playerName = decodeURIComponent(pathname.slice('/v1/photo/'.length)).replace(/[-_]/g, ' ').trim();
                if (!playerName) {
                    return this.sendJson(res, 400, { error: 'Bad Request', message: 'Player name is required.' });
                }
                try {
                    const photoRes = await (0, photoScraper_1.scrapePlayerPhoto)(playerName);
                    const photoUrl = photoRes?.photoUrl || null;
                    return this.sendJson(res, 200, {
                        name: playerName,
                        photoUrl: photoUrl,
                        scrapedAt: new Date().toISOString()
                    });
                }
                catch (err) {
                    return this.sendJson(res, 500, { error: 'Scraper Error', message: err.message });
                }
            }
            // GET /v1/players/:idSlug -> Lookup specific player by slug or name
            if (pathname.startsWith('/v1/players/')) {
                const slugOrName = decodeURIComponent(pathname.slice('/v1/players/'.length)).toLowerCase().trim();
                const player = this.profiles.find(p => p.id === slugOrName ||
                    p.name.toLowerCase() === slugOrName ||
                    p.synonyms?.includes(slugOrName));
                if (!player) {
                    return this.sendJson(res, 404, {
                        error: 'Not Found',
                        message: `Player "${slugOrName}" was not found in the verified database.`
                    });
                }
                return this.sendJson(res, 200, player);
            }
            // Fallthrough 404
            return this.sendJson(res, 404, {
                error: 'Not Found',
                message: 'Endpoint not found. Valid routes: /v1/players, /v1/players/random, /v1/players/:id, /v1/photo/:name, /v1/health'
            });
        });
        return new Promise((resolve) => {
            server.listen(this.port, () => {
                console.log(`=============================================================`);
                console.log(` ⚽ Football-Data-Scraper REST API Server Running!          `);
                console.log(`    URL       : http://localhost:${this.port}                `);
                console.log(`    API Keys  : ${Array.from(this.apiKeys).join(', ')}       `);
                console.log(`    Endpoints : GET /v1/players?apiKey=...                  `);
                console.log(`                GET /v1/players/random?era=...&apiKey=...   `);
                console.log(`                GET /v1/players/:id?apiKey=...              `);
                console.log(`                GET /v1/photo/:name?apiKey=...              `);
                console.log(`                GET /v1/health (Public status)              `);
                console.log(`=============================================================`);
                resolve(server);
            });
        });
    }
}
exports.FootballApiServer = FootballApiServer;
