/**
 * Historical Football Knowledge Graph & Relational Entity Types
 * Supports clubs, current & past stadiums, trophies, national team crests, and country flags.
 */

export interface ClubBadge {
  url: string;           // SVG or PNG crest URL
  period?: string;       // e.g. "Present Day", "1997–2021", "1978–1997"
  isCurrent: boolean;    // true for current official badge, false for historical badges
}

export interface ClubProfile {
  id: string;            // Normalized slug (e.g., "arsenal", "new-york-cosmos")
  name: string;          // Official club name (e.g., "Arsenal F.C.")
  shortName?: string;    // e.g. "Arsenal"
  synonyms: string[];    // e.g. ["the gunners", "arsenal fc", "afc"]
  country: string;       // e.g. "England"
  flagUrl?: string;      // Country flag SVG URL
  league: string;        // e.g. "Premier League", "EFL Championship", "NASL", "MLS"
  founded: number;       // Founded year (e.g., 1886)
  badges: ClubBadge[];   // Present day and historical badges
  stadiumIds: string[];  // Links to current and past StadiumProfiles (e.g. ["highbury", "emirates-stadium"])
  trophyIds: string[];   // Links to TrophyProfiles (e.g. ["fa-cup", "premier-league"])
  managerIds?: string[]; // Links to notable managers
  lastScrapedAt?: string;
}

export interface StadiumProfile {
  id: string;            // Normalized slug (e.g., "highbury", "emirates-stadium")
  name: string;          // Official stadium name
  synonyms: string[];    // Alternative names or nicknames
  clubIds: string[];     // Clubs that played at this ground (e.g. ["arsenal"])
  city: string;          // e.g. "London"
  country: string;       // e.g. "England"
  capacity?: number;     // e.g. 38419
  openedYear?: number;   // e.g. 1913
  closedYear?: number;   // e.g. 2006 (undefined if still active)
  isHistoric: boolean;   // true for demolished/former stadiums (Highbury, Maine Road, White Hart Lane)
  imageUrl?: string;     // Wikimedia photo representing the stadium
  lastScrapedAt?: string;
}

export interface TrophyProfile {
  id: string;            // Normalized slug (e.g., "fa-cup", "premier-league", "uefa-champions-league")
  name: string;          // Trophy official name
  shortName?: string;    // e.g. "FA Cup"
  imageUrl: string;      // Wikimedia image representing the trophy
  region: string;        // e.g. "England", "Europe", "South America", "USA"
}

export interface NationalTeamProfile {
  id: string;            // Normalized slug (e.g., "england", "brazil", "argentina")
  name: string;          // e.g. "England National Football Team"
  shortName?: string;    // e.g. "England"
  crestUrl?: string;     // FA / National Team Crest (e.g. Three Lions crest, CBF crest, AFA crest)
  flagUrl?: string;      // National Flag SVG URL
  confederation?: string;// e.g. "UEFA", "CONMEBOL"
}

export interface ManagerStint {
  clubId: string;        // e.g. "arsenal", "manchester-united"
  startYear: number;     // e.g. 1996
  endYear?: number;      // e.g. 2018
  trophiesWon?: string[];// e.g. ["premier-league", "fa-cup"]
}

export interface ManagerProfile {
  id: string;            // e.g. "arsene-wenger", "sir-alex-ferguson", "pep-guardiola"
  name: string;          // e.g. "Arsène Wenger"
  synonyms: string[];    // e.g. ["wenger", "le professeur"]
  nationality: string;   // e.g. "France"
  flagUrl?: string;      // Country flag SVG URL
  photoUrl?: string;     // Wikimedia photo URL
  stints: ManagerStint[];
}

export interface FootballKnowledgeGraph {
  clubs: Record<string, ClubProfile>;
  stadiums: Record<string, StadiumProfile>;
  trophies: Record<string, TrophyProfile>;
  nationalTeams: Record<string, NationalTeamProfile>;
  managers: Record<string, ManagerProfile>;
  updatedAt: string;
}
