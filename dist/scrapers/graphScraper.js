"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFootballKnowledgeGraph = buildFootballKnowledgeGraph;
/**
 * Historical Football Knowledge Graph Seed & Scraper Engine
 * Provides cross-referenced Clubs, Stadiums (Current & Past), Trophies,
 * National Team Crests, and Country Flags.
 */
const SEED_CLUBS = {
    'arsenal': {
        id: 'arsenal',
        name: 'Arsenal F.C.',
        shortName: 'Arsenal',
        synonyms: ['the gunners', 'arsenal fc', 'afc'],
        country: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        league: 'Premier League',
        founded: 1886,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
                period: '2002–Present',
                isCurrent: true
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/b/b3/Arsenal_FC_1949-2002.svg',
                period: '1949–2002 (Victoria Concordia Crescit)',
                isCurrent: false
            }
        ],
        stadiumIds: ['highbury', 'emirates-stadium'],
        trophyIds: ['fa-cup', 'premier-league']
    },
    'tottenham': {
        id: 'tottenham',
        name: 'Tottenham Hotspur F.C.',
        shortName: 'Tottenham',
        synonyms: ['spurs', 'tottenham hotspur', 'thfc'],
        country: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        league: 'Premier League',
        founded: 1882,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
                period: '2006–Present',
                isCurrent: true
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/b/bd/Tottenham_Hotspur_old_crest_1983-2006.svg',
                period: '1983–2006',
                isCurrent: false
            }
        ],
        stadiumIds: ['white-hart-lane', 'tottenham-hotspur-stadium'],
        trophyIds: ['fa-cup']
    },
    'manchester-city': {
        id: 'manchester-city',
        name: 'Manchester City F.C.',
        shortName: 'Man City',
        synonyms: ['city', 'citizens', 'mcfc', 'manchester city'],
        country: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        league: 'Premier League',
        founded: 1880,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
                period: '2016–Present',
                isCurrent: true
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/b/b1/Manchester_City_1997-2016.svg',
                period: '1997–2016 (Golden Eagle Crest)',
                isCurrent: false
            }
        ],
        stadiumIds: ['maine-road', 'etihad-stadium'],
        trophyIds: ['premier-league', 'fa-cup', 'uefa-champions-league']
    },
    'manchester-united': {
        id: 'manchester-united',
        name: 'Manchester United F.C.',
        shortName: 'Man United',
        synonyms: ['united', 'red devils', 'mufc', 'man utd'],
        country: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        league: 'Premier League',
        founded: 1878,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
                period: '1998–Present',
                isCurrent: true
            }
        ],
        stadiumIds: ['old-trafford'],
        trophyIds: ['premier-league', 'fa-cup', 'uefa-champions-league']
    },
    'west-ham': {
        id: 'west-ham',
        name: 'West Ham United F.C.',
        shortName: 'West Ham',
        synonyms: ['hammers', 'irons', 'whufc', 'west ham united'],
        country: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        league: 'Premier League',
        founded: 1895,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
                period: '2016–Present',
                isCurrent: true
            },
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/0/09/West_Ham_United_FC_%281999–2016%29.svg',
                period: '1999–2016 (Boleyn Castle Crest)',
                isCurrent: false
            }
        ],
        stadiumIds: ['boleyn-ground', 'london-stadium'],
        trophyIds: ['fa-cup']
    },
    'new-york-cosmos': {
        id: 'new-york-cosmos',
        name: 'New York Cosmos',
        shortName: 'NY Cosmos',
        synonyms: ['cosmos', 'ny cosmos', 'new york cosmos'],
        country: 'USA',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg',
        league: 'NASL (Historical)',
        founded: 1970,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/en/3/3c/New_York_Cosmos_logo.svg',
                period: '1970–1985 (Pelé & Beckenbauer Era)',
                isCurrent: false
            }
        ],
        stadiumIds: ['giants-stadium'],
        trophyIds: ['nasl-soccer-bowl']
    },
    'santos': {
        id: 'santos',
        name: 'Santos Futebol Clube',
        shortName: 'Santos',
        synonyms: ['santos fc', 'peixe', 'santos'],
        country: 'Brazil',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
        league: 'Brasileirão',
        founded: 1912,
        badges: [
            {
                url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png',
                period: '1925–Present',
                isCurrent: true
            }
        ],
        stadiumIds: ['vila-belmiro'],
        trophyIds: ['copa-libertadores']
    }
};
const SEED_STADIUMS = {
    'highbury': {
        id: 'highbury',
        name: 'Arsenal Stadium (Highbury)',
        synonyms: ['highbury', 'the home of football', 'arsenal stadium'],
        clubIds: ['arsenal'],
        city: 'London',
        country: 'England',
        capacity: 38419,
        openedYear: 1913,
        closedYear: 2006,
        isHistoric: true,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Highbury_East_Stand.jpg'
    },
    'emirates-stadium': {
        id: 'emirates-stadium',
        name: 'Emirates Stadium',
        synonyms: ['the emirates', 'ashburton grove'],
        clubIds: ['arsenal'],
        city: 'London',
        country: 'England',
        capacity: 60704,
        openedYear: 2006,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Emirates_Stadium%2C_Arsenal_FC.jpg'
    },
    'white-hart-lane': {
        id: 'white-hart-lane',
        name: 'White Hart Lane',
        synonyms: ['the lane', 'white hart lane'],
        clubIds: ['tottenham'],
        city: 'London',
        country: 'England',
        capacity: 36284,
        openedYear: 1899,
        closedYear: 2017,
        isHistoric: true,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/White_Hart_Lane_2016.jpg'
    },
    'tottenham-hotspur-stadium': {
        id: 'tottenham-hotspur-stadium',
        name: 'Tottenham Hotspur Stadium',
        synonyms: ['new white hart lane', 'tottenham stadium'],
        clubIds: ['tottenham'],
        city: 'London',
        country: 'England',
        capacity: 62850,
        openedYear: 2019,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Tottenham_Hotspur_Stadium_-_South_Stand.jpg'
    },
    'maine-road': {
        id: 'maine-road',
        name: 'Maine Road',
        synonyms: ['the wembley of the north', 'maine road'],
        clubIds: ['manchester-city'],
        city: 'Manchester',
        country: 'England',
        capacity: 35150,
        openedYear: 1923,
        closedYear: 2003,
        isHistoric: true,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Maine_Road_Main_Stand.jpg'
    },
    'etihad-stadium': {
        id: 'etihad-stadium',
        name: 'Etihad Stadium',
        synonyms: ['city of manchester stadium', 'the etihad', 'eastlands'],
        clubIds: ['manchester-city'],
        city: 'Manchester',
        country: 'England',
        capacity: 53400,
        openedYear: 2003,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Etihad_Stadium_Manchester.jpg'
    },
    'boleyn-ground': {
        id: 'boleyn-ground',
        name: 'Boleyn Ground (Upton Park)',
        synonyms: ['upton park', 'boleyn ground', 'the boleyn'],
        clubIds: ['west-ham'],
        city: 'London',
        country: 'England',
        capacity: 35016,
        openedYear: 1904,
        closedYear: 2016,
        isHistoric: true,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Boleyn_Ground_Main_Stand.jpg'
    },
    'london-stadium': {
        id: 'london-stadium',
        name: 'London Stadium',
        synonyms: ['olympic stadium', 'london stadium'],
        clubIds: ['west-ham'],
        city: 'London',
        country: 'England',
        capacity: 62500,
        openedYear: 2016,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/London_Stadium_2016.jpg'
    },
    'old-trafford': {
        id: 'old-trafford',
        name: 'Old Trafford',
        synonyms: ['the theatre of dreams', 'old trafford'],
        clubIds: ['manchester-united'],
        city: 'Manchester',
        country: 'England',
        capacity: 74310,
        openedYear: 1910,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Old_Trafford_inside_20060726_1.jpg'
    },
    'giants-stadium': {
        id: 'giants-stadium',
        name: 'Giants Stadium',
        synonyms: ['the meadowlands', 'giants stadium'],
        clubIds: ['new-york-cosmos'],
        city: 'East Rutherford',
        country: 'USA',
        capacity: 80242,
        openedYear: 1976,
        closedYear: 2010,
        isHistoric: true,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Giants_Stadium_2008.jpg'
    },
    'vila-belmiro': {
        id: 'vila-belmiro',
        name: 'Estádio Urbano Caldeira (Vila Belmiro)',
        synonyms: ['vila belmiro', 'estadio urbano caldeira'],
        clubIds: ['santos'],
        city: 'Santos',
        country: 'Brazil',
        capacity: 16068,
        openedYear: 1916,
        isHistoric: false,
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Vila_Belmiro_Stadium.jpg'
    }
};
const SEED_TROPHIES = {
    'fa-cup': {
        id: 'fa-cup',
        name: 'The FA Cup',
        shortName: 'FA Cup',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/FA_Cup_trophy.jpg',
        region: 'England'
    },
    'premier-league': {
        id: 'premier-league',
        name: 'Premier League / Football League First Division',
        shortName: 'Premier League',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
        region: 'England'
    },
    'uefa-champions-league': {
        id: 'uefa-champions-league',
        name: 'UEFA Champions League / European Cup',
        shortName: 'Champions League',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/bf/UEFA_Champions_League_logo_2.svg',
        region: 'Europe'
    },
    'copa-libertadores': {
        id: 'copa-libertadores',
        name: 'Copa Libertadores',
        shortName: 'Libertadores',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Copa_Libertadores_logo.svg',
        region: 'South America'
    },
    'nasl-soccer-bowl': {
        id: 'nasl-soccer-bowl',
        name: 'NASL Soccer Bowl Trophy',
        shortName: 'Soccer Bowl',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/NASL_Soccer_Bowl_logo.svg',
        region: 'USA'
    }
};
const SEED_NATIONAL_TEAMS = {
    'england': {
        id: 'england',
        name: 'England National Football Team',
        shortName: 'England',
        crestUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8b/England_national_football_team_crest.svg',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        confederation: 'UEFA'
    },
    'brazil': {
        id: 'brazil',
        name: 'Brazil National Football Team',
        shortName: 'Brazil',
        crestUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/CBF_crest.svg',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
        confederation: 'CONMEBOL'
    },
    'argentina': {
        id: 'argentina',
        name: 'Argentina National Football Team',
        shortName: 'Argentina',
        crestUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Argentina_national_football_team_logo.svg',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg',
        confederation: 'CONMEBOL'
    },
    'france': {
        id: 'france',
        name: 'France National Football Team',
        shortName: 'France',
        crestUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e7/France_national_football_team_seal.svg',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
        confederation: 'UEFA'
    }
};
const SEED_MANAGERS = {
    'arsene-wenger': {
        id: 'arsene-wenger',
        name: 'Arsène Wenger',
        synonyms: ['wenger', 'le professeur'],
        nationality: 'France',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg',
        stints: [
            {
                clubId: 'arsenal',
                startYear: 1996,
                endYear: 2018,
                trophiesWon: ['premier-league', 'fa-cup']
            }
        ]
    },
    'sir-alex-ferguson': {
        id: 'sir-alex-ferguson',
        name: 'Sir Alex Ferguson',
        synonyms: ['fergie', 'sir alex', 'ferguson'],
        nationality: 'Scotland',
        stints: [
            {
                clubId: 'manchester-united',
                startYear: 1986,
                endYear: 2013,
                trophiesWon: ['premier-league', 'fa-cup', 'uefa-champions-league']
            }
        ]
    },
    'pep-guardiola': {
        id: 'pep-guardiola',
        name: 'Pep Guardiola',
        synonyms: ['guardiola', 'pep'],
        nationality: 'Spain',
        stints: [
            {
                clubId: 'manchester-city',
                startYear: 2016,
                trophiesWon: ['premier-league', 'fa-cup', 'uefa-champions-league']
            }
        ]
    },
    'brian-clough': {
        id: 'brian-clough',
        name: 'Brian Clough',
        synonyms: ['cloughie', 'clough'],
        nationality: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        stints: [
            {
                clubId: 'nottingham-forest',
                startYear: 1975,
                endYear: 1993,
                trophiesWon: ['uefa-champions-league']
            }
        ]
    },
    'herbert-chapman': {
        id: 'herbert-chapman',
        name: 'Herbert Chapman',
        synonyms: ['chapman'],
        nationality: 'England',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Flag_of_England.svg',
        stints: [
            {
                clubId: 'arsenal',
                startYear: 1925,
                endYear: 1934,
                trophiesWon: ['fa-cup', 'premier-league']
            }
        ]
    },
    'matt-busby': {
        id: 'matt-busby',
        name: 'Sir Matt Busby',
        synonyms: ['busby', 'sir matt busby'],
        nationality: 'Scotland',
        stints: [
            {
                clubId: 'manchester-united',
                startYear: 1945,
                endYear: 1969,
                trophiesWon: ['premier-league', 'fa-cup', 'uefa-champions-league']
            }
        ]
    },
    'mario-zagallo': {
        id: 'mario-zagallo',
        name: 'Mário Zagallo',
        synonyms: ['zagallo', 'velho lobo'],
        nationality: 'Brazil',
        flagUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg',
        stints: [
            {
                clubId: 'brazil',
                startYear: 1970,
                endYear: 1974
            }
        ]
    }
};
function buildFootballKnowledgeGraph() {
    return {
        clubs: SEED_CLUBS,
        stadiums: SEED_STADIUMS,
        trophies: SEED_TROPHIES,
        nationalTeams: SEED_NATIONAL_TEAMS,
        managers: SEED_MANAGERS,
        updatedAt: new Date().toISOString()
    };
}
