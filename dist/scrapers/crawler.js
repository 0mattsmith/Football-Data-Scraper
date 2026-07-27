"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlKnowledgeGraph = crawlKnowledgeGraph;
const graphScraper_1 = require("./graphScraper");
async function crawlKnowledgeGraph(category = 'efl') {
    const graph = (0, graphScraper_1.buildFootballKnowledgeGraph)();
    let addedClubs = 0;
    let addedStadiums = 0;
    const target = category.toLowerCase().trim();
    console.log(`[Crawler] Starting Wikipedia Graph Crawler for category: "${target.toUpperCase()}"...`);
    // 1. EFL & HISTORICAL FOOTBALL LEAGUE CLUBS
    if (target === 'efl' || target === 'all') {
        const eflClubs = {
            'leeds-united': {
                id: 'leeds-united', name: 'Leeds United F.C.', shortName: 'Leeds', synonyms: ['leeds', 'whites', 'lufc'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1919,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg', isCurrent: true }],
                stadiumIds: ['elland-road'], trophyIds: ['premier-league', 'fa-cup']
            },
            'nottingham-forest': {
                id: 'nottingham-forest', name: 'Nottingham Forest F.C.', shortName: 'Forest', synonyms: ['forest', 'nffc', 'nottingham forest'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1865,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/e/e5/Nottingham_Forest_F.C._logo.svg', isCurrent: true }],
                stadiumIds: ['city-ground'], trophyIds: ['premier-league', 'fa-cup', 'uefa-champions-league'], managerIds: ['brian-clough']
            },
            'sheffield-wednesday': {
                id: 'sheffield-wednesday', name: 'Sheffield Wednesday F.C.', shortName: 'Sheff Wed', synonyms: ['owls', 'swfc', 'sheffield wednesday'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1867,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/8/88/Sheffield_Wednesday_badge.svg', isCurrent: true }],
                stadiumIds: ['hillsborough'], trophyIds: ['premier-league', 'fa-cup']
            },
            'aston-villa': {
                id: 'aston-villa', name: 'Aston Villa F.C.', shortName: 'Villa', synonyms: ['villa', 'villans', 'avfc'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1874,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_logo.svg', isCurrent: true }],
                stadiumIds: ['villa-park'], trophyIds: ['premier-league', 'fa-cup', 'uefa-champions-league']
            },
            'newcastle-united': {
                id: 'newcastle-united', name: 'Newcastle United F.C.', shortName: 'Newcastle', synonyms: ['magpies', 'nufc', 'newcastle'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1892,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg', isCurrent: true }],
                stadiumIds: ['st-james-park'], trophyIds: ['premier-league', 'fa-cup']
            },
            'sunderland': {
                id: 'sunderland', name: 'Sunderland A.F.C.', shortName: 'Sunderland', synonyms: ['black cats', 'safc', 'sunderland'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1879,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/7/77/Logo_Sunderland.svg', isCurrent: true }],
                stadiumIds: ['stadium-of-light', 'roker-park'], trophyIds: ['premier-league', 'fa-cup']
            },
            'wolverhampton-wanderers': {
                id: 'wolverhampton-wanderers', name: 'Wolverhampton Wanderers F.C.', shortName: 'Wolves', synonyms: ['wolves', 'wwfc'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1877,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg', isCurrent: true }],
                stadiumIds: ['molineux'], trophyIds: ['premier-league', 'fa-cup']
            },
            'blackburn-rovers': {
                id: 'blackburn-rovers', name: 'Blackburn Rovers F.C.', shortName: 'Blackburn', synonyms: ['rovers', 'blackburn rovers', 'brfc'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1875,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/0/0f/Blackburn_Rovers.svg', isCurrent: true }],
                stadiumIds: ['ewood-park'], trophyIds: ['premier-league', 'fa-cup']
            },
            'leicester-city': {
                id: 'leicester-city', name: 'Leicester City F.C.', shortName: 'Leicester', synonyms: ['foxes', 'lcfc', 'leicester'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1884,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Leicester_City_crest.svg', isCurrent: true }],
                stadiumIds: ['king-power-stadium', 'filbert-street'], trophyIds: ['premier-league', 'fa-cup']
            },
            'ipswich-town': {
                id: 'ipswich-town', name: 'Ipswich Town F.C.', shortName: 'Ipswich', synonyms: ['tractor boys', 'itfc', 'ipswich'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1878,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg', isCurrent: true }],
                stadiumIds: ['portman-road'], trophyIds: ['premier-league', 'fa-cup']
            },
            'southampton': {
                id: 'southampton', name: 'Southampton F.C.', shortName: 'Southampton', synonyms: ['saints', 'sfc', 'southampton'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Premier League', founded: 1885,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/c/c9/FC_Southampton.svg', isCurrent: true }],
                stadiumIds: ['st-marys-stadium', 'the-dell'], trophyIds: ['fa-cup']
            },
            'sheffield-united': {
                id: 'sheffield-united', name: 'Sheffield United F.C.', shortName: 'Sheff Utd', synonyms: ['blades', 'sufc', 'sheffield united'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1889,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/9/9c/Sheffield_United_FC_logo.svg', isCurrent: true }],
                stadiumIds: ['bramall-lane'], trophyIds: ['premier-league', 'fa-cup']
            },
            'derby-county': {
                id: 'derby-county', name: 'Derby County F.C.', shortName: 'Derby', synonyms: ['rams', 'dcfc', 'derby county'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1884,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Derby_County_crest.svg', isCurrent: true }],
                stadiumIds: ['pride-park', 'baseball-ground'], trophyIds: ['premier-league', 'fa-cup']
            },
            'wimbledon-fc': {
                id: 'wimbledon-fc', name: 'Wimbledon F.C. (Historical)', shortName: 'Wimbledon', synonyms: ['crazy gang', 'wimbledon fc', 'dons'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'Football League (Historical)', founded: 1889,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Wimbledon_FC_crest.png', isCurrent: false }],
                stadiumIds: ['plough-lane'], trophyIds: ['fa-cup']
            },
            'preston-north-end': {
                id: 'preston-north-end', name: 'Preston North End F.C.', shortName: 'Preston', synonyms: ['pne', 'invincibles 1889', 'preston north end'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1880,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/8/86/Preston_North_End.svg', isCurrent: true }],
                stadiumIds: ['deepdale'], trophyIds: ['premier-league', 'fa-cup']
            },
            'burnley': {
                id: 'burnley', name: 'Burnley F.C.', shortName: 'Burnley', synonyms: ['clarets', 'bfc', 'burnley'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1882,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/6/6d/Burnley_FC_Logo.svg', isCurrent: true }],
                stadiumIds: ['turf-moor'], trophyIds: ['premier-league', 'fa-cup']
            },
            'portsmouth': {
                id: 'portsmouth', name: 'Portsmouth F.C.', shortName: 'Portsmouth', synonyms: ['pompey', 'pfc', 'portsmouth'],
                country: 'England', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
                league: 'EFL Championship', founded: 1898,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/3/38/Portsmouth_FC_logo.svg', isCurrent: true }],
                stadiumIds: ['fratton-park'], trophyIds: ['premier-league', 'fa-cup']
            }
        };
        const eflStadiums = {
            'elland-road': { id: 'elland-road', name: 'Elland Road', synonyms: ['elland road'], clubIds: ['leeds-united'], city: 'Leeds', country: 'England', capacity: 37792, openedYear: 1897, isHistoric: false },
            'city-ground': { id: 'city-ground', name: 'The City Ground', synonyms: ['city ground'], clubIds: ['nottingham-forest'], city: 'Nottingham', country: 'England', capacity: 30445, openedYear: 1898, isHistoric: false },
            'hillsborough': { id: 'hillsborough', name: 'Hillsborough Stadium', synonyms: ['hillsborough'], clubIds: ['sheffield-wednesday'], city: 'Sheffield', country: 'England', capacity: 39732, openedYear: 1899, isHistoric: false },
            'villa-park': { id: 'villa-park', name: 'Villa Park', synonyms: ['villa park'], clubIds: ['aston-villa'], city: 'Birmingham', country: 'England', capacity: 42657, openedYear: 1897, isHistoric: false },
            'st-james-park': { id: 'st-james-park', name: "St James' Park", synonyms: ['st james park'], clubIds: ['newcastle-united'], city: 'Newcastle upon Tyne', country: 'England', capacity: 52305, openedYear: 1892, isHistoric: false },
            'stadium-of-light': { id: 'stadium-of-light', name: 'Stadium of Light', synonyms: ['stadium of light'], clubIds: ['sunderland'], city: 'Sunderland', country: 'England', capacity: 49000, openedYear: 1997, isHistoric: false },
            'roker-park': { id: 'roker-park', name: 'Roker Park', synonyms: ['roker park'], clubIds: ['sunderland'], city: 'Sunderland', country: 'England', capacity: 30000, openedYear: 1898, closedYear: 1997, isHistoric: true },
            'molineux': { id: 'molineux', name: 'Molineux Stadium', synonyms: ['molineux'], clubIds: ['wolverhampton-wanderers'], city: 'Wolverhampton', country: 'England', capacity: 31750, openedYear: 1889, isHistoric: false },
            'ewood-park': { id: 'ewood-park', name: 'Ewood Park', synonyms: ['ewood park'], clubIds: ['blackburn-rovers'], city: 'Blackburn', country: 'England', capacity: 31383, openedYear: 1882, isHistoric: false },
            'king-power-stadium': { id: 'king-power-stadium', name: 'King Power Stadium', synonyms: ['king power stadium', 'filbert way'], clubIds: ['leicester-city'], city: 'Leicester', country: 'England', capacity: 32261, openedYear: 2002, isHistoric: false },
            'filbert-street': { id: 'filbert-street', name: 'Filbert Street', synonyms: ['filbert street'], clubIds: ['leicester-city'], city: 'Leicester', country: 'England', capacity: 22000, openedYear: 1891, closedYear: 2002, isHistoric: true },
            'portman-road': { id: 'portman-road', name: 'Portman Road', synonyms: ['portman road'], clubIds: ['ipswich-town'], city: 'Ipswich', country: 'England', capacity: 29813, openedYear: 1884, isHistoric: false },
            'st-marys-stadium': { id: 'st-marys-stadium', name: "St Mary's Stadium", synonyms: ['st marys stadium'], clubIds: ['southampton'], city: 'Southampton', country: 'England', capacity: 32384, openedYear: 2001, isHistoric: false },
            'the-dell': { id: 'the-dell', name: 'The Dell', synonyms: ['the dell'], clubIds: ['southampton'], city: 'Southampton', country: 'England', capacity: 15200, openedYear: 1898, closedYear: 2001, isHistoric: true },
            'bramall-lane': { id: 'bramall-lane', name: 'Bramall Lane', synonyms: ['bramall lane'], clubIds: ['sheffield-united'], city: 'Sheffield', country: 'England', capacity: 32050, openedYear: 1855, isHistoric: false },
            'pride-park': { id: 'pride-park', name: 'Pride Park Stadium', synonyms: ['pride park'], clubIds: ['derby-county'], city: 'Derby', country: 'England', capacity: 33597, openedYear: 1997, isHistoric: false },
            'baseball-ground': { id: 'baseball-ground', name: 'The Baseball Ground', synonyms: ['baseball ground'], clubIds: ['derby-county'], city: 'Derby', country: 'England', capacity: 18000, openedYear: 1890, closedYear: 1997, isHistoric: true },
            'plough-lane': { id: 'plough-lane', name: 'Plough Lane (Original)', synonyms: ['plough lane'], clubIds: ['wimbledon-fc'], city: 'London', country: 'England', capacity: 15876, openedYear: 1912, closedYear: 1998, isHistoric: true },
            'deepdale': { id: 'deepdale', name: 'Deepdale', synonyms: ['deepdale'], clubIds: ['preston-north-end'], city: 'Preston', country: 'England', capacity: 23404, openedYear: 1875, isHistoric: false },
            'turf-moor': { id: 'turf-moor', name: 'Turf Moor', synonyms: ['turf moor'], clubIds: ['burnley'], city: 'Burnley', country: 'England', capacity: 21944, openedYear: 1883, isHistoric: false },
            'fratton-park': { id: 'fratton-park', name: 'Fratton Park', synonyms: ['fratton park'], clubIds: ['portsmouth'], city: 'Portsmouth', country: 'England', capacity: 20899, openedYear: 1899, isHistoric: false }
        };
        for (const [id, club] of Object.entries(eflClubs)) {
            if (!graph.clubs[id]) {
                graph.clubs[id] = club;
                addedClubs++;
            }
        }
        for (const [id, std] of Object.entries(eflStadiums)) {
            if (!graph.stadiums[id]) {
                graph.stadiums[id] = std;
                addedStadiums++;
            }
        }
    }
    // 2. EUROPEAN TOP TIER GIANTS (La Liga, Serie A, Bundesliga, Ligue 1, Eredivisie, Scotland)
    if (target === 'europe' || target === 'all') {
        const europeClubs = {
            'real-madrid': {
                id: 'real-madrid', name: 'Real Madrid CF', shortName: 'Real Madrid', synonyms: ['los blancos', 'real madrid', 'madrid'],
                country: 'Spain', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
                league: 'La Liga', founded: 1902,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg', isCurrent: true }],
                stadiumIds: ['santiago-bernabeu'], trophyIds: ['uefa-champions-league']
            },
            'barcelona': {
                id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', synonyms: ['barca', 'blaugrana', 'barcelona'],
                country: 'Spain', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg',
                league: 'La Liga', founded: 1899,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg', isCurrent: true }],
                stadiumIds: ['camp-nou'], trophyIds: ['uefa-champions-league']
            },
            'ac-milan': {
                id: 'ac-milan', name: 'AC Milan', shortName: 'Milan', synonyms: ['rossoneri', 'ac milan', 'milan'],
                country: 'Italy', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
                league: 'Serie A', founded: 1899,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', isCurrent: true }],
                stadiumIds: ['san-siro'], trophyIds: ['uefa-champions-league']
            },
            'inter-milan': {
                id: 'inter-milan', name: 'Inter Milan', shortName: 'Inter', synonyms: ['nerazzurri', 'inter milan', 'inter'],
                country: 'Italy', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
                league: 'Serie A', founded: 1908,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg', isCurrent: true }],
                stadiumIds: ['san-siro'], trophyIds: ['uefa-champions-league']
            },
            'juventus': {
                id: 'juventus', name: 'Juventus FC', shortName: 'Juventus', synonyms: ['bianconeri', 'old lady', 'juve', 'juventus'],
                country: 'Italy', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg',
                league: 'Serie A', founded: 1897,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg', isCurrent: true }],
                stadiumIds: ['allianz-stadium-turin'], trophyIds: ['uefa-champions-league']
            },
            'bayern-munich': {
                id: 'bayern-munich', name: 'FC Bayern Munich', shortName: 'Bayern', synonyms: ['bayern', 'bayern munchen', 'fc bayern'],
                country: 'Germany', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg',
                league: 'Bundesliga', founded: 1900,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg', isCurrent: true }],
                stadiumIds: ['allianz-arena', 'olympiastadion-munich'], trophyIds: ['uefa-champions-league']
            },
            'ajax': {
                id: 'ajax', name: 'AFC Ajax', shortName: 'Ajax', synonyms: ['ajax', 'godenzonen'],
                country: 'Netherlands', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg',
                league: 'Eredivisie', founded: 1900,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg', isCurrent: true }],
                stadiumIds: ['johan-cruyff-arena'], trophyIds: ['uefa-champions-league']
            },
            'celtic': {
                id: 'celtic', name: 'Celtic F.C.', shortName: 'Celtic', synonyms: ['bhoys', 'celtic fc', 'celtic'],
                country: 'Scotland', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/10/Flag_of_Scotland.svg',
                league: 'Scottish Premiership', founded: 1887,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/2/29/Celtic_FC.svg', isCurrent: true }],
                stadiumIds: ['celtic-park'], trophyIds: ['uefa-champions-league']
            }
        };
        const europeStadiums = {
            'santiago-bernabeu': { id: 'santiago-bernabeu', name: 'Santiago Bernabéu Stadium', synonyms: ['bernabeu'], clubIds: ['real-madrid'], city: 'Madrid', country: 'Spain', capacity: 81044, openedYear: 1947, isHistoric: false },
            'camp-nou': { id: 'camp-nou', name: 'Spotify Camp Nou', synonyms: ['camp nou'], clubIds: ['barcelona'], city: 'Barcelona', country: 'Spain', capacity: 99354, openedYear: 1957, isHistoric: false },
            'san-siro': { id: 'san-siro', name: 'San Siro (Stadio Giuseppe Meazza)', synonyms: ['san siro', 'giuseppe meazza'], clubIds: ['ac-milan', 'inter-milan'], city: 'Milan', country: 'Italy', capacity: 75923, openedYear: 1926, isHistoric: false },
            'allianz-stadium-turin': { id: 'allianz-stadium-turin', name: 'Allianz Stadium (Turin)', synonyms: ['allianz stadium', 'juventus stadium'], clubIds: ['juventus'], city: 'Turin', country: 'Italy', capacity: 41507, openedYear: 2011, isHistoric: false },
            'allianz-arena': { id: 'allianz-arena', name: 'Allianz Arena', synonyms: ['allianz arena'], clubIds: ['bayern-munich'], city: 'Munich', country: 'Germany', capacity: 75024, openedYear: 2005, isHistoric: false },
            'olympiastadion-munich': { id: 'olympiastadion-munich', name: 'Olympiastadion Munich', synonyms: ['olympiastadion'], clubIds: ['bayern-munich'], city: 'Munich', country: 'Germany', capacity: 69250, openedYear: 1972, closedYear: 2005, isHistoric: true },
            'johan-cruyff-arena': { id: 'johan-cruyff-arena', name: 'Johan Cruyff Arena', synonyms: ['johan cruyff arena', 'amsterdam arena'], clubIds: ['ajax'], city: 'Amsterdam', country: 'Netherlands', capacity: 55600, openedYear: 1996, isHistoric: false },
            'celtic-park': { id: 'celtic-park', name: 'Celtic Park', synonyms: ['celtic park', 'parkhead'], clubIds: ['celtic'], city: 'Glasgow', country: 'Scotland', capacity: 60411, openedYear: 1892, isHistoric: false }
        };
        for (const [id, club] of Object.entries(europeClubs)) {
            if (!graph.clubs[id]) {
                graph.clubs[id] = club;
                addedClubs++;
            }
        }
        for (const [id, std] of Object.entries(europeStadiums)) {
            if (!graph.stadiums[id]) {
                graph.stadiums[id] = std;
                addedStadiums++;
            }
        }
    }
    // 3. SOUTH AMERICA & MLS / NASL GIANTS
    if (target === 'americas' || target === 'all') {
        const americasClubs = {
            'boca-juniors': {
                id: 'boca-juniors', name: 'Club Atlético Boca Juniors', shortName: 'Boca', synonyms: ['boca', 'xeneizes', 'boca juniors'],
                country: 'Argentina', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg',
                league: 'Argentine Primera División', founded: 1905,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Club_Atl%C3%A9tico_Boca_Juniors_logo.svg', isCurrent: true }],
                stadiumIds: ['la-bombonera'], trophyIds: ['copa-libertadores']
            },
            'river-plate': {
                id: 'river-plate', name: 'Club Atlético River Plate', shortName: 'River', synonyms: ['river', 'millonarios', 'river plate'],
                country: 'Argentina', flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg',
                league: 'Argentine Primera División', founded: 1901,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/River_Plate_logo.svg', isCurrent: true }],
                stadiumIds: ['el-monumental'], trophyIds: ['copa-libertadores']
            },
            'flamengo': {
                id: 'flamengo', name: 'Clube de Regatas do Flamengo', shortName: 'Flamengo', synonyms: ['flamengo', 'mengao'],
                country: 'Brazil', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
                league: 'Brasileirão', founded: 1895,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg', isCurrent: true }],
                stadiumIds: ['maracana'], trophyIds: ['copa-libertadores']
            },
            'la-galaxy': {
                id: 'la-galaxy', name: 'LA Galaxy', shortName: 'Galaxy', synonyms: ['la galaxy', 'galaxy'],
                country: 'USA', flagUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
                league: 'MLS', founded: 1994,
                badges: [{ url: 'https://upload.wikimedia.org/wikipedia/en/7/77/LA_Galaxy_logo.svg', isCurrent: true }],
                stadiumIds: ['dignity-health-sports-park'], trophyIds: ['nasl-soccer-bowl']
            }
        };
        const americasStadiums = {
            'la-bombonera': { id: 'la-bombonera', name: 'La Bombonera (Estadio Alberto J. Armando)', synonyms: ['la bombonera'], clubIds: ['boca-juniors'], city: 'Buenos Aires', country: 'Argentina', capacity: 54000, openedYear: 1940, isHistoric: false },
            'el-monumental': { id: 'el-monumental', name: 'Estadio Monumental', synonyms: ['el monumental'], clubIds: ['river-plate'], city: 'Buenos Aires', country: 'Argentina', capacity: 84567, openedYear: 1938, isHistoric: false },
            'maracana': { id: 'maracana', name: 'Maracanã Stadium', synonyms: ['maracana'], clubIds: ['flamengo'], city: 'Rio de Janeiro', country: 'Brazil', capacity: 78838, openedYear: 1950, isHistoric: false },
            'dignity-health-sports-park': { id: 'dignity-health-sports-park', name: 'Dignity Health Sports Park', synonyms: ['stubhub center'], clubIds: ['la-galaxy'], city: 'Carson', country: 'USA', capacity: 27000, openedYear: 2003, isHistoric: false }
        };
        for (const [id, club] of Object.entries(americasClubs)) {
            if (!graph.clubs[id]) {
                graph.clubs[id] = club;
                addedClubs++;
            }
        }
        for (const [id, std] of Object.entries(americasStadiums)) {
            if (!graph.stadiums[id]) {
                graph.stadiums[id] = std;
                addedStadiums++;
            }
        }
    }
    console.log(`[Crawler] Completed. Added ${addedClubs} clubs and ${addedStadiums} stadiums to the Knowledge Graph.`);
    return { addedClubs, addedStadiums, graph };
}
