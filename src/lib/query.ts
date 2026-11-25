import type { Filters, Game, SortKey, Status } from "../types";

export const emptyFilters = (): Filters => ({
  keyword: "",
  platforms: [],
  genres: [],
  status: "全部",
  minScore: 0,
  yearFrom: 2000,
  yearTo: new Date().getFullYear(),
});

export function collectGenres(games: Game[]): string[] {
  const set = new Set<string>();
  for (const g of games) for (const t of g.genres) set.add(t);
  return [...set].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function matchKeyword(g: Game, keyword: string): boolean {
  if (!keyword.trim()) return true;
  const k = keyword.trim().toLowerCase();
  return (
    g.title.toLowerCase().includes(k) ||
    g.titleEn.toLowerCase().includes(k) ||
    g.developer.toLowerCase().includes(k) ||
    g.publisher.toLowerCase().includes(k) ||
    g.tags.some((t) => t.toLowerCase().includes(k)) ||
    g.genres.some((t) => t.toLowerCase().includes(k))
  );
}

export function filterGames(games: Game[], f: Filters): Game[] {
  return games.filter((g) => {
    if (!matchKeyword(g, f.keyword)) return false;
    if (f.platforms.length && !f.platforms.some((p) => g.platforms.includes(p))) return false;
    if (f.genres.length && !f.genres.some((t) => g.genres.includes(t))) return false;
    if (f.status !== "全部" && g.status !== (f.status as Status)) return false;
    if (g.score < f.minScore) return false;
    if (g.year < f.yearFrom || g.year > f.yearTo) return false;
    return true;
  });
}

const compare: Record<SortKey, (a: Game, b: Game) => number> = {
  score: (a, b) => b.score - a.score || b.year - a.year,
  year: (a, b) => b.year - a.year || b.score - a.score,
  hours: (a, b) => b.hours - a.hours,
  title: (a, b) => a.title.localeCompare(b.title, "zh-CN"),
};

export function sortGames(games: Game[], key: SortKey): Game[] {
  return [...games].sort(compare[key]);
}

export function formatHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k`;
  return String(h);
}
