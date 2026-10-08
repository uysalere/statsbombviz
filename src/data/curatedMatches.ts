import { MatchInfo } from '../types/statsbomb';

export const STATSBOMB_BASE_URL = 'https://raw.githubusercontent.com/statsbomb/open-data/master/data/events/';

export const CURATED_MATCHES: MatchInfo[] = [
  {
    id: '3869685',
    name: 'Argentina vs France (World Cup 2022 Final)',
    competition: 'FIFA World Cup 2022',
    season: '2022',
    homeTeam: 'Argentina',
    awayTeam: 'France',
    homeScore: 3,
    awayScore: 3,
    date: '18 Dec 2022',
    dataUrl: `${STATSBOMB_BASE_URL}3869685.json`
  },
  {
    id: '3869519',
    name: 'Netherlands vs Argentina (World Cup 2022 QF)',
    competition: 'FIFA World Cup 2022',
    season: '2022',
    homeTeam: 'Netherlands',
    awayTeam: 'Argentina',
    homeScore: 2,
    awayScore: 2,
    date: '09 Dec 2022',
    dataUrl: `${STATSBOMB_BASE_URL}3869519.json`
  },
  {
    id: '3795506',
    name: 'Italy vs England (UEFA Euro 2020 Final)',
    competition: 'UEFA Euro 2020',
    season: '2020',
    homeTeam: 'Italy',
    awayTeam: 'England',
    homeScore: 1,
    awayScore: 1,
    date: '11 Jul 2021',
    dataUrl: `${STATSBOMB_BASE_URL}3795506.json`
  },
  {
    id: '18236',
    name: 'Juventus vs Barcelona (UCL Final 2015)',
    competition: 'UEFA Champions League',
    season: '2014/2015',
    homeTeam: 'Juventus',
    awayTeam: 'Barcelona',
    homeScore: 1,
    awayScore: 3,
    date: '06 Jun 2015',
    dataUrl: `${STATSBOMB_BASE_URL}18236.json`
  },
  {
    id: '7576',
    name: 'France vs Argentina (World Cup 2018 R16)',
    competition: 'FIFA World Cup 2018',
    season: '2018',
    homeTeam: 'France',
    awayTeam: 'Argentina',
    homeScore: 4,
    awayScore: 3,
    date: '30 Jun 2018',
    dataUrl: `${STATSBOMB_BASE_URL}7576.json`
  },
  {
    id: '8658',
    name: 'France vs Croatia (World Cup 2018 Final)',
    competition: 'FIFA World Cup 2018',
    season: '2018',
    homeTeam: 'France',
    awayTeam: 'Croatia',
    homeScore: 4,
    awayScore: 2,
    date: '15 Jul 2018',
    dataUrl: `${STATSBOMB_BASE_URL}8658.json`
  },
  {
    id: '15946',
    name: 'Barcelona vs Deportivo La Coruña',
    competition: 'La Liga',
    season: '2015/2016',
    homeTeam: 'Barcelona',
    awayTeam: 'Deportivo La Coruña',
    dataUrl: `${STATSBOMB_BASE_URL}15946.json`
  },
  {
    id: '3775635',
    name: 'Chelsea FCW vs Arsenal WFC',
    competition: "FA Women's Super League",
    season: '2020/2021',
    homeTeam: 'Chelsea FCW',
    awayTeam: 'Arsenal WFC',
    dataUrl: `${STATSBOMB_BASE_URL}3775635.json`
  }
];

export const RANDOM_GAME_IDS = [
  "3869685", "3869519", "3795506", "18236", "7576", "8658",
  "15946", "15956", "15973", "15978", "15986", "3775635"
];
