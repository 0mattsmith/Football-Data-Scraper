# ⚽ Football-Data-Scraper

An autonomous, ever-evolving Footballer Data Scraper & Archive Engine from FA inception (1863) to the present day. Built for **Half Time • Football Trivia Arena** (`GridBlitz Trivia`), featuring AI-selected generic faceshot photos and rich Wikipedia infobox career enrichment.

---

## 🚀 Instant Usage via CLI (No Clone Required!)

You can run this scraper CLI directly from any terminal using `npx`:

### 1. Inspect any Footballer's Enriched Profile
Scrapes clean playing position, iconic shirt number (`#7`, `#10`, etc.), international caps & goals, career clubs, trophies, and managerial careers:

```bash
npx --allow-git=all github:0mattsmith/Football-Data-Scraper info "David Beckham"
```
```bash
npx --allow-git=all github:0mattsmith/Football-Data-Scraper info "Frank Lampard"
```

### 2. Scrape canonical generic portrait photo
Scores aspect ratio, headshot keywords, and Wikipedia infobox images to select the cleanest generic faceshot:

```bash
npx --allow-git=all github:0mattsmith/Football-Data-Scraper photo "Cole Palmer"
```

### 3. Scrape by Era or Trending Wonderkids
Scrapes and exports footballer profiles to JSON and Firebase Firestore:

```bash
# Discover & scrape newest wonderkids and breakout stars
npx --allow-git=all github:0mattsmith/Football-Data-Scraper scrape -e trending

# Scrape all eras (Pioneers 1863-1945, Post-War 1946-1991, Premier League 1992-2022, Modern 2023+, Trending)
npx --allow-git=all github:0mattsmith/Football-Data-Scraper scrape -e all
```

### 4. REST API Server with API Key Authentication 🔑
Start a lightweight HTTP REST API server with custom API Keys so friends, family, or third-party apps can build football trivia games with a single line of code:

```bash
# Start API Server on port 3000 with custom API keys
npx --allow-git=all github:0mattsmith/Football-Data-Scraper serve --port 3000 --api-keys "gb_live_demo_key,gb_live_brother_01"
```

#### API Endpoints (Requires `X-API-Key: <key>` Header or `?apiKey=<key>` Query Parameter)
- `GET /v1/players?apiKey=gb_live_demo_key` — Return all verified legends & wonderkids
- `GET /v1/players/random?era=premierleague&apiKey=gb_live_demo_key` — Random trivia player generator
- `GET /v1/players/david-beckham?apiKey=gb_live_demo_key` — Get enriched profile for a specific player
- `GET /v1/photo/cole-palmer?apiKey=gb_live_demo_key` — Live generic portrait photo scraper
- `GET /v1/graph?apiKey=gb_live_demo_key` — Full Historical Football Knowledge Graph
- `GET /v1/clubs?apiKey=gb_live_demo_key` — All clubs (EFL, Historic FL, Europe, South America, MLS/NASL)
- `GET /v1/stadiums?apiKey=gb_live_demo_key` — Current and historic/demolished stadiums
- `GET /v1/health` — Public health check & status (No API key required)

### 5. Inspect Historical Football Knowledge Graph
Inspect cross-referenced Clubs, Stadiums (current & historic/demolished), Badges, Trophies, National Team Crests, and Country Flags:

```bash
# Query present-day and historic badges & stadiums for a club
npx --allow-git=all github:0mattsmith/Football-Data-Scraper graph clubs arsenal

# Query historic or demolished stadiums (opening/closing dates & capacities)
npx --allow-git=all github:0mattsmith/Football-Data-Scraper graph stadiums highbury
```

---

## 📦 Features & Capabilities
- **Multi-Era Historical Architecture**: Covers 158+ verified footballers across 5 distinct eras.
- **AI Generic Photo Scraper**: Evaluates Wikimedia REST APIs & infoboxes to avoid low-resolution or off-center action photos.
- **Rich Infobox Parser**:
  - `position`: Canonical clean playing position.
  - `shirtNumber`: Iconic squad jersey numbers (`#7`, `#10`, `#9`, etc.).
  - `caps` & `internationalGoals`: National team appearances and goals.
  - `teamsManaged`: Unlinked and linked managerial careers for iconic player-managers.
- **Firebase Firestore Cloud Integration**: Direct batch upserting into live Cloud Firestore collections (`npm run upsert:firestore`).
