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
exports.scrapePlayerPhoto = scrapePlayerPhoto;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
/**
 * Scrapes player photos from Wikipedia/Wikimedia and uses AI & heuristic ranking
 * to select the single most iconic, generic portrait faceshot.
 */
async function scrapePlayerPhoto(title, htmlContent) {
    const normTitle = title.trim();
    const restUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(normTitle.replace(/\s+/g, '_'))}`;
    const candidates = [];
    // 1. Fetch canonical Wikipedia REST summary image (Wikimedia's primary portrait selection)
    try {
        const res = await axios_1.default.get(restUrl, {
            headers: {
                'User-Agent': 'FootballDataScraper/1.0 (https://github.com/0mattsmith/GridBlitz-Trivia; contact@example.com)'
            },
            timeout: 8000
        });
        const data = res.data;
        if (data && data.originalimage && data.originalimage.source) {
            const orig = data.originalimage;
            const thumb = data.thumbnail?.source || orig.source;
            const aspectScore = orig.height >= orig.width ? 30 : 0; // portraits score +30
            candidates.push({
                photoUrl: orig.source,
                thumbnailUrl: thumb,
                score: 80 + aspectScore,
                reason: 'Canonical Wikimedia infobox portrait'
            });
        }
    }
    catch (err) {
        // REST API might 404 for certain titles, fall through to HTML parsing
    }
    // 2. Parse candidate images from Wikipedia infobox HTML if available
    if (htmlContent) {
        try {
            const $ = cheerio.load(htmlContent);
            const infobox = $('table.infobox');
            infobox.find('img').each((_, img) => {
                let src = $(img).attr('src') || '';
                if (src.startsWith('//')) {
                    src = `https:${src}`;
                }
                // Ignore icons, flags, SVGs, medals, and signatures
                if (!src ||
                    src.endsWith('.svg') ||
                    src.includes('Flag_of') ||
                    src.includes('Symbol_') ||
                    src.includes('signature') ||
                    src.includes('crest')) {
                    return;
                }
                const lowerSrc = src.toLowerCase();
                let score = 50;
                const reasons = ['Infobox image candidate'];
                // Scoring heuristics for "generic faceshot / portrait"
                if (lowerSrc.includes('portrait') || lowerSrc.includes('headshot') || lowerSrc.includes('face')) {
                    score += 25;
                    reasons.push('Contains portrait/headshot keyword');
                }
                if (lowerSrc.includes('stadium') || lowerSrc.includes('crowd') || lowerSrc.includes('team_group')) {
                    score -= 30;
                    reasons.push('Penalty for wide/group shot keyword');
                }
                // Convert Wikipedia thumbnail URL to full resolution if possible
                let fullResUrl = src;
                if (src.includes('/thumb/')) {
                    // e.g. https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Foo.jpg/220px-Foo.jpg -> remove /220px-Foo.jpg and /thumb/
                    const parts = src.split('/');
                    parts.pop(); // remove thumbnail filename
                    const thumbIndex = parts.indexOf('thumb');
                    if (thumbIndex !== -1) {
                        parts.splice(thumbIndex, 1);
                    }
                    fullResUrl = parts.join('/');
                }
                candidates.push({
                    photoUrl: fullResUrl,
                    thumbnailUrl: src,
                    score,
                    reason: reasons.join('; ')
                });
            });
        }
        catch (e) {
            // ignore parsing error
        }
    }
    if (!candidates.length) {
        return null;
    }
    // Sort by highest score (AI / heuristic ranking for best generic faceshot)
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
}
