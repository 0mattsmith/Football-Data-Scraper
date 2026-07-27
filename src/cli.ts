#!/usr/bin/env node

import { Command } from 'commander';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { scrapeEraProfiles, FootballEra } from './scrapers/wikidataScraper';
import { exportToLocalDb, syncToHalfTimeTrivia } from './syncer/exportDb';
import { upsertToFirestore } from './syncer/firestoreUpsert';
import { FootballApiServer } from './api/server';

const program = new Command();

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
    const era = options.era as FootballEra;
    console.log(`[Scrape] Starting career scrape for era: ${era.toUpperCase()}...`);

    const profiles = await scrapeEraProfiles(era);
    console.log(`[Scrape] Completed scraping ${profiles.length} profiles.`);

    const outFile = exportToLocalDb(profiles);

    if (options.sync) {
      syncToHalfTimeTrivia(profiles);
    }

    if (options.firestore) {
      await upsertToFirestore(profiles);
    }

    console.log(`[Scrape] Done!`);
  });

program
  .command('photo <name>')
  .description('Scrape and select the best generic portrait faceshot photo for a footballer')
  .action(async (name) => {
    console.log(`[Photo Scraper] Searching Wikimedia & Infoboxes for best generic faceshot of "${name}"...`);
    const { scrapePlayerPhoto } = await import('./scrapers/photoScraper');
    const result = await scrapePlayerPhoto(name);
    if (result) {
      console.log(`[Photo Scraper] ✅ Selected Iconic Generic Faceshot for ${name}:`);
      console.log(`   Photo URL    : ${result.photoUrl}`);
      console.log(`   Thumbnail    : ${result.thumbnailUrl}`);
      console.log(`   Score        : ${result.score}`);
      console.log(`   Selection    : ${result.reason}`);
    } else {
      console.log(`[Photo Scraper] ⚠️ No suitable portrait photo found for "${name}".`);
    }
  });

program
  .command('info <name>')
  .description('Scrape and display enriched career profile (position, shirt number, caps, teams managed)')
  .action(async (name) => {
    console.log(`[Info Scraper] Extracting enriched Wikipedia infobox data for "${name}"...`);
    const { scrapeWikipediaInfobox } = await import('./scrapers/infoboxScraper');
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
    } else {
      console.log(`[Info Scraper] ⚠️ Could not extract profile for "${name}".`);
    }
  });

program
  .command('sync')
  .description('Sync existing scraped database directly into Half Time • Football Trivia Arena')
  .action(async () => {
    const distFile = path.join(__dirname, '../dist/footballer-db.json');
    if (fs.existsSync(distFile)) {
      const data = JSON.parse(fs.readFileSync(distFile, 'utf8'));
      syncToHalfTimeTrivia(data);
    } else {
      console.log(`[Sync] No existing database in dist/. Running a scrape first...`);
      const profiles = await scrapeEraProfiles('all');
      syncToHalfTimeTrivia(profiles);
    }
  });

program
  .command('firestore')
  .description('Upsert local database profiles into Firebase Firestore')
  .action(async () => {
    const distFile = path.join(__dirname, '../dist/footballer-db.json');
    let profiles = [];
    if (fs.existsSync(distFile)) {
      profiles = JSON.parse(fs.readFileSync(distFile, 'utf8'));
    } else {
      profiles = await scrapeEraProfiles('premierleague');
    }
    await upsertToFirestore(profiles);
  });

program
  .command('serve')
  .description('Start REST API server for Half Time Trivia & third-party games with API Key authentication')
  .option('-p, --port <number>', 'Port number to listen on', '3000')
  .option('-k, --api-keys <keys>', 'Comma-separated valid API keys', 'gb_live_demo_key,gb_live_brother_01')
  .action(async (options) => {
    const port = parseInt(options.port, 10) || 3000;
    const apiKeys = (options.apiKeys || '').split(',').map((k: string) => k.trim()).filter(Boolean);
    const server = new FootballApiServer(port, apiKeys);
    await server.start();
  });

program.parse(process.argv);
