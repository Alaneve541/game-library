import type { Game } from "../types";
import { formatHours } from "../lib/query";

interface Props {
  game: Game;
  onOpen: (g: Game) => void;
}

export default function GameCard({ game, onOpen }: Props) {
  return (
    <button type="button" className="card" onClick={() => onOpen(game)}>
      <span className="card-cover" style={{ background: game.accent }} aria-hidden="true">
        <span className="card-initial">{game.title.slice(0, 1)}</span>
        <span className="card-year">{game.year}</span>
      </span>
      <span className="card-body">
        <span className="card-title">{game.title}</span>
        <span className="card-sub">{game.titleEn}</span>
        <span className="card-meta">
          <span className="score">{game.score.toFixed(1)}</span>
          <span className="dot">·</span>
          <span>{game.genres[0]}</span>
          <span className="dot">·</span>
          <span>{formatHours(game.hours)} h</span>
        </span>
        <span className="card-tags">
          {game.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </span>
      </span>
      <span className={game.status === "在玩" ? "badge badge-live" : "badge"}>{game.status}</span>
    </button>
  );
}
