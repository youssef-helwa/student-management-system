import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Search…', style }) {
  return (
    <div className="search-input-wrap" style={{ minWidth: 220, ...style }}>
      <Search size={15} />
      <input
        className="input"
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
