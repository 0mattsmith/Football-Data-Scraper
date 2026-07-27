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
