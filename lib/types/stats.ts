export interface DailyVisit {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface SiteStats {
  today: DailyVisit;
  total: number;
  history: DailyVisit[];
}
