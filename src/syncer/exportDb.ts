import fs from 'fs';
import path from 'path';
import { FootballerProfile } from '../types/footballer';

/**
 * Deduplicates, cleans, and exports footballer profiles to JSON format.
 * Optionally syncs directly into the Half Time • Football Trivia Arena directory.
 */
export function exportToLocalDb(profiles: FootballerProfile[], targetDir?: string): string {
  // Deduplicate by name (case-insensitive) after sanitizing names
  const uniqueMap = new Map<string, FootballerProfile>();
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
    } else {
      // Merge clubs and synonyms if already existing
      const existing = uniqueMap.get(key)!;
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
  const outDir = targetDir || path.join(__dirname, '../../dist');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'footballer-db.json');
  fs.writeFileSync(outFile, JSON.stringify(sortedProfiles, null, 2), 'utf8');
  console.log(`[Export] Successfully exported ${sortedProfiles.length} players to: ${outFile}`);

  return outFile;
}

/**
 * Automatically syncs the exported database file into Half Time • Football Trivia Arena.
 */
export function syncToHalfTimeTrivia(profiles: FootballerProfile[]): string {
  const halfTimeDir = path.resolve('C:\\Users\\Matt\\Documents\\Development\\GridBlitz Trivia');
  if (!fs.existsSync(halfTimeDir)) {
    console.warn(`[Sync] Target directory not found: ${halfTimeDir}`);
    return exportToLocalDb(profiles);
  }

  const destFile = path.join(halfTimeDir, 'footballer-db.json');
  let existingProfiles: FootballerProfile[] = [];
  if (fs.existsSync(destFile)) {
    try {
      existingProfiles = (JSON.parse(fs.readFileSync(destFile, 'utf8')) as FootballerProfile[])
        .filter(p => {
          const str = JSON.stringify(p).toLowerCase();
          return !str.includes('mw-parser-output') && !str.includes('font-weight') && !str.includes('nobold') && !str.includes('hurstmbe');
        });
      console.log(`[Sync] Found ${existingProfiles.length} existing valid profiles in Half Time Trivia. Merging...`);
    } catch (e: any) {
      console.warn(`[Sync] Could not parse existing footballer-db.json: ${e.message}`);
    }
  }

  const combinedProfiles = [...profiles, ...existingProfiles];
  const outFile = exportToLocalDb(combinedProfiles, halfTimeDir);
  console.log(`[Sync] Successfully synced database to Half Time Trivia: ${destFile}`);
  return destFile;
}
