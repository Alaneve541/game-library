import { useEffect, useRef } from "react";
import type { Game } from "../types";
import { formatHours } from "../lib/query";

interface Props {
  game: Game;
  onClose: () => void;
}

export default function GameDetail({ game, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-cover" style={{ background: game.accent }}>
          <span className="detail-initial">{game.title.slice(0, 1)}</span>
          <button ref={closeRef} type="button" className="detail-close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="detail-body">
          <h2 id="detail-title">{game.title}</h2>
          <p className="detail-sub">
            {game.titleEn} · {game.developer} · {game.year}
          </p>

          <dl className="detail-stats">
            <div>
              <dt>评分</dt>
              <dd className="big">{game.score.toFixed(1)}</dd>
            </div>
            <div>
              <dt>游玩时长</dt>
              <dd>{formatHours(game.hours)} h</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>{game.status}</dd>
            </div>
            <div>
              <dt>平台</dt>
              <dd>{game.platforms.join(" / ")}</dd>
            </div>
          </dl>

          <p className="detail-summary">{game.summary}</p>

          <section className="detail-note">
            <h3>机制拆解笔记</h3>
            <p>{game.note}</p>
          </section>

          <div className="detail-tags">
            {game.genres.map((g) => (
              <span key={g} className="tag tag-genre">{g}</span>
            ))}
            {game.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
