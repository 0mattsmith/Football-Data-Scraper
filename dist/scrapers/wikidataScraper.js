"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SEED_ICONS_BY_ERA = void 0;
exports.scrapeEraProfiles = scrapeEraProfiles;
const synonymGenerator_1 = require("./synonymGenerator");
const infoboxScraper_1 = require("./infoboxScraper");
const photoScraper_1 = require("./photoScraper");
/**
 * Curated seed list of iconic players across football history to ensure
 * instant offline availability and guaranteed recognition.
 */
exports.SEED_ICONS_BY_ERA = {
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
    ]
};
/**
 * Fetches and aggregates profiles for a given era or list of names.
 */
async function scrapeEraProfiles(era = 'premierleague') {
    const names = era === 'all'
        ? Object.values(exports.SEED_ICONS_BY_ERA).flat()
        : exports.SEED_ICONS_BY_ERA[era] || exports.SEED_ICONS_BY_ERA['premierleague'];
    const results = [];
    for (const name of names) {
        // Attempt Wikipedia scrape
        const scraped = await (0, infoboxScraper_1.scrapeWikipediaInfobox)(name);
        if (scraped && scraped.clubs.length > 0) {
            results.push(scraped);
        }
        else {
            // Fallback profile if Wikipedia network is offline or unreached
            const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            const synonyms = (0, synonymGenerator_1.generateSynonyms)(name);
            const photoResult = await (0, photoScraper_1.scrapePlayerPhoto)(name);
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
