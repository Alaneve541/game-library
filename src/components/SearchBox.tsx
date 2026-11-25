interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function SearchBox({ value, onChange }: Props) {
  return (
    <div className="search">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        placeholder="搜游戏名、开发商、标签（如「肉鸽」「UE5」）"
        aria-label="搜索游戏"
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button type="button" className="search-clear" aria-label="清空搜索" onClick={() => onChange("")}>
          ×
        </button>
      )}
    </div>
  );
}
