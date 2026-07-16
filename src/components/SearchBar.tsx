import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
        <Search size={20} />
      </span>
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search resources"
        className="w-full rounded-2xl border border-border bg-bg-soft py-3.5 pl-12 pr-11 text-base text-white placeholder:text-muted/70 outline-none transition-colors focus:border-accent"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition-colors hover:text-white"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
