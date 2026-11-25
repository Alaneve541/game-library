import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game, SortKey } from "./types";
import { GAMES } from "./data/games";
import SearchBox from "./components/SearchBox";
import FilterBar from "./components/FilterBar";
import GameCard from "./components/GameCard";
import GameDetail from "./components/GameDetail";
import { useDebounced } from "./hooks/useDebounced";
import { filterGames, sortGames, emptyFilters, collectGenres } from "./lib/query";

const PAGE_SIZE = 12;

export default function App() {
  const [filters, setFilters] = useState(emptyFilters);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [selected, setSelected] = useState<Game | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const keyword = useDebounced(filters.keyword, 200);
  const allGenres = useMemo(() => collectGenres(GAMES), []);

  const result = useMemo(() => {
    const filtered = filterGames(GAMES, { ...filters, keyword });
    return sortGames(filtered, sortKey);
  }, [filters, keyword, sortKey]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [keyword, filters.platforms, filters.genres, filters.status, filters.minScore, filters.yearFrom, filters.yearTo, sortKey]);

  const shown = result.slice(0, visible);

  const open = useCallback((g: Game) => setSelected(g), []);
  const close = useCallback(() => setSelected(null), []);

  const reset = useCallback(() => setFilters(emptyFilters()), []);

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div>
            <h1>游戏库</h1>
            <p className="sub">
              20 款长期在玩的游戏 · 按平台 / 类型 / 年份 / 评分筛选 · 每款附一条机制拆解笔记
            </p>
          </div>
          <div className="hero-stats">
            <div>
              <strong>{GAMES.length}</strong>
              <span>收录</span>
            </div>
            <div>
              <strong>{GAMES.reduce((s, g) => s + g.hours, 0)}</strong>
              <span>累计小时</span>
            </div>
            <div>
              <strong>{allGenres.length}</strong>
              <span>类型</span>
            </div>
          </div>
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <FilterBar
            filters={filters}
            genres={allGenres}
            onChange={setFilters}
            onReset={reset}
          />
        </aside>

        <section className="content">
          <div className="toolbar">
            <SearchBox
              value={filters.keyword}
              onChange={(keyword) => setFilters((f) => ({ ...f, keyword }))}
            />
            <label className="sort">
              排序
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
                <option value="score">评分最高</option>
                <option value="year">年份最新</option>
                <option value="hours">游玩时长</option>
                <option value="title">名称</option>
              </select>
            </label>
          </div>

          <p className="count">
            共 {result.length} 款{result.length !== GAMES.length ? `（全部 ${GAMES.length} 款）` : ""}
          </p>

          {result.length === 0 ? (
            <div className="empty">
              <h2>没有符合条件的游戏</h2>
              <p>试试放宽筛选条件，或清空搜索词。</p>
              <button type="button" className="btn" onClick={reset}>清空筛选</button>
            </div>
          ) : (
            <>
              <ul className="grid">
                {shown.map((g) => (
                  <li key={g.id}>
                    <GameCard game={g} onOpen={open} />
                  </li>
                ))}
              </ul>
              {visible < result.length && (
                <div className="more">
                  <button type="button" className="btn" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                    加载更多（还剩 {result.length - visible} 款）
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="foot">
        <span>Vite + React 18 + TypeScript，无 UI 框架，筛选与排序均为客户端计算</span>
      </footer>

      {selected && <GameDetail game={selected} onClose={close} />}
    </div>
  );
}
