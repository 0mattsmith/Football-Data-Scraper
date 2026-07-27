import http, { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';
import { FootballerProfile } from '../types/footballer';
import { scrapePlayerPhoto } from '../scrapers/photoScraper';
import { FootballKnowledgeGraph } from '../types/graph';
import { buildFootballKnowledgeGraph } from '../scrapers/graphScraper';

/**
 * Football-Data-Scraper REST API Server with API Key Authentication & CORS.
 * Serves verified footballer profiles, random trivia question generators,
 * and live generic photo / infobox enrichment over HTTP.
 */
export class FootballApiServer {
  private profiles: FootballerProfile[] = [];
  private graph: FootballKnowledgeGraph = buildFootballKnowledgeGraph();
  private apiKeys: Set<string>;
  private port: number;

  constructor(port: number = 3000, apiKeys: string[] = ['gb_live_demo_key', 'gb_live_brother_01']) {
    this.port = port;
    this.apiKeys = new Set(apiKeys.map(k => k.trim()).filter(Boolean));
    this.loadDatabase();
  }

  private loadDatabase() {
    try {
      const dbPath = path.resolve(__dirname, '../../dist/footballer-db.json');
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8');
        this.profiles = JSON.parse(raw);
        console.log(`[API Server] Loaded ${this.profiles.length} verified footballer profiles from local database.`);
      } else {
        console.warn(`[API Server] Warning: Database not found at ${dbPath}. Run 'npm run scrape:full' first.`);
      }
    } catch (err: any) {
      console.error(`[API Server] Error loading database: ${err.message}`);
    }
  }

  private sendJson(res: ServerResponse, statusCode: number, data: any) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-API-Key, Authorization, Content-Type'
    });
    res.end(JSON.stringify(data, null, 2));
  }

  private authenticate(req: IncomingMessage, url: URL): boolean {
    // Check X-API-Key header
    const headerKey = req.headers['x-api-key'] as string;
    if (headerKey && this.apiKeys.has(headerKey)) return true;

    // Check Authorization: Bearer <key> header
    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      if (this.apiKeys.has(token)) return true;
    }

    // Check ?apiKey=<key> query param
    const queryKey = url.searchParams.get('apiKey');
    if (queryKey && this.apiKeys.has(queryKey)) return true;

    return false;
  }

  public start(): Promise<http.Server> {
    const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
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

      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
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
          const photoRes = await scrapePlayerPhoto(playerName);
          const photoUrl = photoRes?.photoUrl || null;
          return this.sendJson(res, 200, {
            name: playerName,
            photoUrl: photoUrl,
            scrapedAt: new Date().toISOString()
          });
        } catch (err: any) {
          return this.sendJson(res, 500, { error: 'Scraper Error', message: err.message });
        }
      }

      // GET /v1/players/:idSlug -> Lookup specific player by slug or name
      if (pathname.startsWith('/v1/players/')) {
        const slugOrName = decodeURIComponent(pathname.slice('/v1/players/'.length)).toLowerCase().trim();
        const player = this.profiles.find(p =>
          p.id === slugOrName ||
          p.name.toLowerCase() === slugOrName ||
          p.synonyms?.includes(slugOrName)
        );

        if (!player) {
          return this.sendJson(res, 404, {
            error: 'Not Found',
            message: `Player "${slugOrName}" was not found in the verified database.`
          });
        }

        return this.sendJson(res, 200, player);
      }

      // GET /v1/graph -> Return full cross-referenced Football Knowledge Graph
      if (pathname === '/v1/graph') {
        return this.sendJson(res, 200, this.graph);
      }

      // GET /v1/clubs -> Return all clubs in knowledge graph
      if (pathname === '/v1/clubs') {
        return this.sendJson(res, 200, { count: Object.keys(this.graph.clubs).length, data: this.graph.clubs });
      }

      // GET /v1/clubs/:id -> Lookup specific club profile
      if (pathname.startsWith('/v1/clubs/')) {
        const clubId = decodeURIComponent(pathname.slice('/v1/clubs/'.length)).toLowerCase().trim();
        const club = this.graph.clubs[clubId] || Object.values(this.graph.clubs).find(c => c.synonyms.includes(clubId));
        if (!club) {
          return this.sendJson(res, 404, { error: 'Not Found', message: `Club "${clubId}" not found in knowledge graph.` });
        }
        return this.sendJson(res, 200, club);
      }

      // GET /v1/stadiums -> Return all current & past stadiums in knowledge graph
      if (pathname === '/v1/stadiums') {
        return this.sendJson(res, 200, { count: Object.keys(this.graph.stadiums).length, data: this.graph.stadiums });
      }

      // GET /v1/stadiums/:id -> Lookup specific stadium profile
      if (pathname.startsWith('/v1/stadiums/')) {
        const stadiumId = decodeURIComponent(pathname.slice('/v1/stadiums/'.length)).toLowerCase().trim();
        const stadium = this.graph.stadiums[stadiumId] || Object.values(this.graph.stadiums).find(s => s.synonyms.includes(stadiumId));
        if (!stadium) {
          return this.sendJson(res, 404, { error: 'Not Found', message: `Stadium "${stadiumId}" not found in knowledge graph.` });
        }
        return this.sendJson(res, 200, stadium);
      }

      // Fallthrough 404
      return this.sendJson(res, 404, {
        error: 'Not Found',
        message: 'Endpoint not found. Valid routes: /v1/players, /v1/players/random, /v1/players/:id, /v1/photo/:name, /v1/graph, /v1/clubs, /v1/stadiums, /v1/health'
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
        console.log(`                GET /v1/graph?apiKey=... (Knowledge Graph)  `);
        console.log(`                GET /v1/clubs?apiKey=...                    `);
        console.log(`                GET /v1/stadiums?apiKey=...                 `);
        console.log(`                GET /v1/health (Public status)              `);
        console.log(`=============================================================`);
        resolve(server);
      });
    });
  }
}
