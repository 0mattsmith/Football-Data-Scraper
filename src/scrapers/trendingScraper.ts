import axios from 'axios';
import * as cheerio from 'cheerio';
import { FootballerProfile } from '../types/footballer';
import { scrapeWikipediaInfobox } from './infoboxScraper';

/**
 * Seed list of breakthrough young stars, wonderkids, and latest transfers
 * representing the "newest of the new" across world football.
 */
export const TRENDING_WONDERKIDS: string[] = [
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
export async function discoverTrendingPlayers(): Promise<string[]> {
  const discovered = new Set<string>(TRENDING_WONDERKIDS);

  try {
    // Crawl Wikipedia Golden Boy (award) page for recent nominees and winners
    const url = 'https://en.wikipedia.org/wiki/Golden_Boy_(award)';
    const res = await axios.get(url, {
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
  } catch (err: any) {
    console.warn(`[TrendingScraper] Could not crawl dynamic Golden Boy table: ${err.message}. Using curated wonderkid seed.`);
  }

  return Array.from(discovered);
}

/**
 * Scrapes enriched profiles for all trending wonderkids and newest players.
 */
export async function scrapeTrendingEra(): Promise<FootballerProfile[]> {
  console.log(`[TrendingScraper] Discovering newest breakout stars and wonderkids...`);
  const names = await discoverTrendingPlayers();
  console.log(`[TrendingScraper] Found ${names.length} trending players to scrape.`);

  const profiles: FootballerProfile[] = [];
  for (const name of names) {
    console.log(`   -> Scraping trending profile: ${name}...`);
    const p = await scrapeWikipediaInfobox(name);
    if (p) {
      profiles.push(p);
    }
  }

  return profiles;
}
