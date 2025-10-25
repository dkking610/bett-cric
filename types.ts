
export interface Sport {
  id: string;
  name: string;
}

export interface Runner {
  name: string;
  odds: number;
}

export interface Market {
  id: string;
  name: string; // e.g., "Moneyline", "Total Points"
  runners: Runner[];
}

export interface Event {
  id: string;
  sportId: string;
  teamA: string;
  teamB: string;
  time: string;
  isLive: boolean;
  markets: Market[];
}

export interface Selection {
  eventId: string;
  eventTitle: string;
  marketId: string;
  marketName: string;
  runnerName: string;
  odds: number;
}

export interface Promotion {
  offer_type: string;
  bonus_amount: number;
  promo_code: string;
  description: string;
}
