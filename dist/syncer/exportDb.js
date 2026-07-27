"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToLocalDb = exportToLocalDb;
exports.syncToHalfTimeTrivia = syncToHalfTimeTrivia;
exports.exportKnowledgeGraph = exportKnowledgeGraph;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const graphScraper_1 = require("../scrapers/graphScraper");
/**
 * Deduplicates, cleans, and exports footballer profiles to JSON format.
 * Optionally syncs directly into the Half Time • Football Trivia Arena directory.
 */
function exportToLocalDb(profiles, targetDir) {
    // Deduplicate by name (case-insensitive) after sanitizing names
    const uniqueMap = new Map();
    for (const p of profiles) {
        const str = JSON.stringify(p).toLowerCase();
        if (!p.name || str.includes('mw-parser-output') || str.includes('font-weight') || str.includes('nobold') || str.includes('hurstmbe')) {
            continue; // skip corrupted entries
        }
        p.name = p.name
            .replace(/(\bOBE\b|\bMBE\b|\bCBE\b|\bGOIH ComM\b|\bUfficiale OMRI\b)/g, '')
            .replace(/^Sir\s+([A-Z])/g, '$1')
            .trim();
        const key = p.name.toLowerCase().trim();
        if (!uniqueMap.has(key)) {
            uniqueMap.set(key, p);
        }
        else {
            // Merge clubs and synonyms if already existing
            const existing = uniqueMap.get(key);
            const mergedClubs = Array.from(new Set([...existing.clubs, ...p.clubs]));
            const mergedSynonyms = Array.from(new Set([...existing.synonyms, ...p.synonyms]));
            const mergedTrophies = Array.from(new Set([...existing.trophies, ...p.trophies]));
            existing.clubs = mergedClubs;
            existing.synonyms = mergedSynonyms;
            existing.trophies = mergedTrophies;
            if (p.photoUrl) {
                existing.photoUrl = p.photoUrl;
            }
            if (p.thumbnailUrl) {
                existing.thumbnailUrl = p.thumbnailUrl;
            }
            if (p.wikiUrl) {
                existing.wikiUrl = p.wikiUrl;
            }
        }
    }
    const sortedProfiles = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    // Write to local dist/
    const outDir = targetDir || path_1.default.join(__dirname, '../../dist');
    if (!fs_1.default.existsSync(outDir)) {
        fs_1.default.mkdirSync(outDir, { recursive: true });
    }
    const outFile = path_1.default.join(outDir, 'footballer-db.json');
    fs_1.default.writeFileSync(outFile, JSON.stringify(sortedProfiles, null, 2), 'utf8');
    console.log(`[Export] Successfully exported ${sortedProfiles.length} players to: ${outFile}`);
    return outFile;
}
/**
 * Automatically syncs the exported database file into Half Time • Football Trivia Arena.
 */
function syncToHalfTimeTrivia(profiles) {
    const halfTimeDir = path_1.default.resolve('C:\\Users\\Matt\\Documents\\Development\\GridBlitz Trivia');
    if (!fs_1.default.existsSync(halfTimeDir)) {
        console.warn(`[Sync] Target directory not found: ${halfTimeDir}`);
        return exportToLocalDb(profiles);
    }
    const destFile = path_1.default.join(halfTimeDir, 'footballer-db.json');
    let existingProfiles = [];
    if (fs_1.default.existsSync(destFile)) {
        try {
            existingProfiles = JSON.parse(fs_1.default.readFileSync(destFile, 'utf8'))
                .filter(p => {
                const str = JSON.stringify(p).toLowerCase();
                return !str.includes('mw-parser-output') && !str.includes('font-weight') && !str.includes('nobold') && !str.includes('hurstmbe');
            });
            console.log(`[Sync] Found ${existingProfiles.length} existing valid profiles in Half Time Trivia. Merging...`);
        }
        catch (e) {
            console.warn(`[Sync] Could not parse existing footballer-db.json: ${e.message}`);
        }
    }
    const combinedProfiles = [...profiles, ...existingProfiles];
    const outFile = exportToLocalDb(combinedProfiles, halfTimeDir);
    exportKnowledgeGraph(halfTimeDir);
    console.log(`[Sync] Successfully synced database & knowledge graph to Half Time Trivia: ${destFile}`);
    return destFile;
}
/**
 * Exports the cross-referenced Football Knowledge Graph to JSON format.
 */
function exportKnowledgeGraph(targetDir) {
    const outDir = targetDir || path_1.default.join(__dirname, '../../dist');
    if (!fs_1.default.existsSync(outDir)) {
        fs_1.default.mkdirSync(outDir, { recursive: true });
    }
    const graph = (0, graphScraper_1.buildFootballKnowledgeGraph)();
    const outFile = path_1.default.join(outDir, 'football-knowledge-graph.json');
    fs_1.default.writeFileSync(outFile, JSON.stringify(graph, null, 2), 'utf8');
    console.log(`[Export] Successfully exported Football Knowledge Graph to: ${outFile}`);
    return outFile;
}
