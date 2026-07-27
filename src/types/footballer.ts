export interface FootballerProfile {
  id?: string;               // Normalized ID or Wikidata Q-ID (e.g., "teddy-sheringham" or "Q192225")
  name: string;              // Official full name (e.g., "Teddy Sheringham")
  synonyms: string[];        // Searchable synonyms & nicknames (e.g., ["sheringham", "teddy sheringham", "sherringham", "t. sheringham"])
  nationality: string;       // Primary nationality (e.g., "England")
  clubs: string[];           // List of all clubs played for in career
  managers: string[];        // Notable managers played under
  trophies: string[];        // Major trophies / honours won
  leagues?: string[];        // Competitions played in (Premier League, Serie A, etc.)
  partners?: string[];       // Notable teammates / partners
  birthYear?: number;        // Birth year (e.g., 1966)
  activeYears?: string;      // e.g. "1983-2008"
  photoUrl?: string;         // Canonical AI-selected generic faceshot/portrait photo URL
  thumbnailUrl?: string;     // Compressed thumbnail faceshot URL
  wikiUrl?: string;          // Wikipedia article URL
  position?: string;         // Playing position (e.g., "Forward", "Midfielder", "Defender", "Goalkeeper")
  shirtNumber?: string;      // Iconic shirt/squad number (e.g., "#7", "#10", "#9")
  caps?: number;             // International caps / appearances (e.g., 106)
  internationalGoals?: number; // International goals scored (e.g., 49)
  teamsManaged?: string[];   // Clubs/national teams managed for player-managers
  lastScrapedAt?: string;    // ISO Timestamp of last scraper run
}
