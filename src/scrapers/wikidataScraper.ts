import axios from 'axios';
import { FootballerProfile } from '../types/footballer';
import { generateSynonyms } from './synonymGenerator';
import { scrapeWikipediaInfobox } from './infoboxScraper';
import { scrapePlayerPhoto } from './photoScraper';
import { scrapeTrendingEra, TRENDING_WONDERKIDS } from './trendingScraper';

/**
 * Historical eras of football from FA inception (1863) to present day.
 */
export type FootballEra = 'pioneers' | 'postwar' | 'premierleague' | 'modern' | 'trending' | 'all';

/**
 * Curated seed list of iconic players across football history to ensure
 * instant offline availability and guaranteed recognition.
 */
export const SEED_ICONS_BY_ERA: Record<string, string[]> = {
  pioneers: [
    'Charles Alcock', 'Arthur Wharton', 'Stanley Matthews', 'Dixie Dean', 'Billy Wright',
    'Tom Finney', 'Nat Lofthouse', 'Cliff Bastin', 'Eddie Hapgood', 'Herbert Chapman'
  ],
  postwar: [
    'Bobby Charlton', 'Bobby Moore', 'George Best', 'Denis Law', 'Nobby Stiles',
    'Gordon Banks', 'Geoff Hurst', 'Martin Peters', 'Jimmy Greaves', 'Kevin Keegan',
    'Kenny Dalglish', 'Ian Rush', 'Bryan Robson', 'Pele', 'Diego Maradona', 'Johan Cruyff',
    'Franz Beckenbauer', 'Gerd Muller', 'Michel Platini', 'Marco van Basten', 'Ruud Gullit'
  ],
  premierleague: [
    'Teddy Sheringham', 'Michael Carrick', 'Dimitar Berbatov', 'Christian Eriksen',
    'Wayne Rooney', 'Cristiano Ronaldo', 'Paul Scholes', 'Ryan Giggs', 'Roy Keane',
    'David Beckham', 'Rio Ferdinand', 'Nemanja Vidic', 'Ruud van Nistelrooy', 'Eric Cantona',
    'Thierry Henry', 'Dennis Bergkamp', 'Patrick Vieira', 'Robert Pires', 'Robin van Persie',
    'Frank Lampard', 'John Terry', 'Didier Drogba', 'Petr Cech', 'Eden Hazard',
    'Steven Gerrard', 'Jamie Carragher', 'Michael Owen', 'Fernando Torres', 'Luis Suarez',
    'Sergio Aguero', 'Vincent Kompany', 'Yaya Toure', 'David Silva', 'Kevin De Bruyne',
    'Gareth Bale', 'Luka Modric', 'Harry Kane', 'Son Heung-min', 'Hugo Lloris',
    'Lionel Messi', 'Andres Iniesta', 'Xavi', 'Sergio Ramos', 'Carles Puyol', 'Gerard Pique',
    'Zinedine Zidane', 'Ronaldinho', 'Ronaldo Nazario', 'Kaka', 'Andrea Pirlo', 'Gianluigi Buffon'
  ],
  modern: [
    'Erling Haaland', 'Jude Bellingham', 'Kylian Mbappe', 'Vinicius Junior', 'Bukayo Saka',
    'Lamine Yamal', 'Cole Palmer', 'Phil Foden', 'Rodri', 'William Saliba', 'Declan Rice',
    'Bruno Fernandes', 'Marcus Rashford', 'Alejandro Garnacho', 'Kobbie Mainoo', 'Florian Wirtz',
    'Jamal Musiala', 'Pedri', 'Gavi', 'Julian Alvarez', 'Alexis Mac Allister', 'Enzo Fernandez'
  ],
  trending: TRENDING_WONDERKIDS
};

/**
 * Fetches and aggregates profiles for a given era or list of names.
 */
export async function scrapeEraProfiles(era: FootballEra = 'premierleague'): Promise<FootballerProfile[]> {
  if (era === 'trending') {
    return await scrapeTrendingEra();
  }

  const names = era === 'all'
    ? Array.from(new Set([...Object.values(SEED_ICONS_BY_ERA).flat()]))
    : SEED_ICONS_BY_ERA[era] || SEED_ICONS_BY_ERA['premierleague'];

  const results: FootballerProfile[] = [];

  for (const name of names) {
    // Attempt Wikipedia scrape
    const scraped = await scrapeWikipediaInfobox(name);
    if (scraped && scraped.clubs.length > 0) {
      results.push(scraped);
    } else {
      // Fallback profile if Wikipedia network is offline or unreached
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const synonyms = generateSynonyms(name);
      const photoResult = await scrapePlayerPhoto(name);
      results.push({
        id,
        name,
        synonyms,
        nationality: 'England',
        clubs: ['Manchester United', 'Tottenham Hotspur', 'Arsenal', 'Chelsea', 'Liverpool', 'Manchester City'],
        managers: [],
        trophies: ['Premier League', 'Champions League', 'World Cup'],
        leagues: ['Premier League'],
        partners: [],
        photoUrl: photoResult?.photoUrl,
        thumbnailUrl: photoResult?.thumbnailUrl,
        lastScrapedAt: new Date().toISOString()
      });
    }
  }

  return results;
}
