import { useMemo } from "react";
import type { Filters, Platform, Status } from "../types";
import { PLATFORMS, STATUSES } from "../types";

interface Props {
  filters: Filters;
  genres: string[];
  onChange: (next: Filters) => void;
  onReset: () => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterBar({ filters, genres, onChange, onReset }: Props) {
  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.keyword.trim()) n++;
    n += filters.platforms.length;
    n += filters.genres.length;
    if (filters.status !== "全部") n++;
    if (filters.minScore > 0) n++;
    if (filters.yearFrom > 2000 || filters.yearTo < new Date().getFullYear()) n++;
    return n;
  }, [filters]);

  return (
    <div className="filters">
      <div className="filters-head">
        <h2>筛选</h2>
        {activeCount > 0 && (
          <button type="button" className="link" onClick={onReset}>
            清空（{activeCount}）
          </button>
        )}
      </div>

      <fieldset>
        <legend>平台</legend>
        <div className="chips">
          {PLATFORMS.map((p: Platform) => (
            <button
              key={p}
              type="button"
              className={filters.platforms.includes(p) ? "chip on" : "chip"}
              aria-pressed={filters.platforms.includes(p)}
              onClick={() => onChange({ ...filters, platforms: toggle(filters.platforms, p) })}
            >
              {p}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>类型</legend>
        <div className="chips">
          {genres.map((g) => (
            <button
              key={g}
              type="button"
              className={filters.genres.includes(g) ? "chip on" : "chip"}
              aria-pressed={filters.genres.includes(g)}
              onClick={() => onChange({ ...filters, genres: toggle(filters.genres, g) })}
            >
              {g}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>状态</legend>
        <div className="chips">
          {(["全部", ...STATUSES] as (Status | "全部")[]).map((s) => (
            <button
              key={s}
              type="button"
              className={filters.status === s ? "chip on" : "chip"}
              aria-pressed={filters.status === s}
              onClick={() => onChange({ ...filters, status: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>
          评分不低于 <b>{filters.minScore.toFixed(1)}</b>
        </legend>
        <input
          type="range"
          min={0}
          max={9.5}
          step={0.5}
          value={filters.minScore}
          onChange={(e) => onChange({ ...filters, minScore: Number(e.target.value) })}
        />
      </fieldset>

      <fieldset>
        <legend>
          年份 <b>{filters.yearFrom}</b> – <b>{filters.yearTo}</b>
        </legend>
        <input
          type="range"
          min={2000}
          max={new Date().getFullYear()}
          step={1}
          value={filters.yearFrom}
          onChange={(e) => onChange({ ...filters, yearFrom: Number(e.target.value) })}
        />
        <input
          type="range"
          min={2000}
          max={new Date().getFullYear()}
          step={1}
          value={filters.yearTo}
          onChange={(e) => onChange({ ...filters, yearTo: Number(e.target.value) })}
        />
      </fieldset>
    </div>
  );
}
