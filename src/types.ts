export type Platform = "PC" | "PS5" | "Switch" | "Mobile";
export type Status = "玩过" | "在玩" | "想玩";

export interface Game {
  id: string;
  title: string;
  titleEn: string;
  developer: string;
  publisher: string;
  year: number;
  platforms: Platform[];
  genres: string[];
  tags: string[];
  score: number;
  hours: number;
  status: Status;
  summary: string;
  /** 我从开发视角记的一条机制笔记 */
  note: string;
  accent: string;
}

export interface Filters {
  keyword: string;
  platforms: Platform[];
  genres: string[];
  status: Status | "全部";
  minScore: number;
  yearFrom: number;
  yearTo: number;
}

export type SortKey = "score" | "year" | "hours" | "title";

export const PLATFORMS: Platform[] = ["PC", "PS5", "Switch", "Mobile"];
export const STATUSES: Status[] = ["玩过", "在玩", "想玩"];
