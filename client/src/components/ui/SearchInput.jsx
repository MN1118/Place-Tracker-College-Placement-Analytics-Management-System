import { FiSearch } from 'react-icons/fi';

export default function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="relative">
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" size={16} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-9"
      />
    </div>
  );
}
