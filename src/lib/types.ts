export type BattingStat = {
  id?: number;
  playerId: number;
  gameId: number;
  plateAppearances: number;
  atBats: number;
  runs: number;
  hits: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  rbi: number;
  walks: number;
  strikeOuts: number;
  stolenBases: number;
};

export type PitchingStat = {
  id?: number;
  playerId: number;
  gameId: number;
  inningsPitched: number; // using float .1, .2
  hits: number;
  runs: number;
  earnedRuns: number;
  walks: number;
  strikeOuts: number;
  homeRuns: number;
  wins: number;
  losses: number;
  saves: number;
};

export type Player = {
  id: number;
  name: string;
  number: number;
  role: string;
  placeOfBirth: string;
  teamId: number;
  battingStats?: BattingStat[];
  pitchingStats?: PitchingStat[];
};

export type Team = {
  id: number;
  name: string;
  players: Player[];
};

export type Game = {
  id: number;
  team1Id: string;
  score1: string;
  hits1: string;
  errors1: string;
  team2Id: string;
  score2: string;
  hits2: string;
  errors2: string;
  day?: string;
  time?: string;
  innings: (string | number)[][]; // 7 innings, 2 teams
  isChampionship?: boolean;
  battingStats?: BattingStat[];
  pitchingStats?: PitchingStat[];
};

export type Standing = {
  teamId: number;
  pos: number;
  w: number;
  l: number;
  rs: number;
  ra: number;
  pct: number;
  gb: number;
};
