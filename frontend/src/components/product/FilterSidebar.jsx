import { RotateCcw } from 'lucide-react';

export const FilterSidebar = ({ filters, onFilterChange, onReset }) => {
  const categories = [
    { label: 'All Formulations', value: '' },
    { label: 'Cleansers', value: 'cleansers' },
    { label: 'Hydrosol Toners', value: 'toners' },
    { label: 'Botanical Oils', value: 'oils' },
    { label: 'Lipid Creams', value: 'creams' },
  ];

  const skinTypes = [
    { label: 'All Complexions', value: '' },
    { label: 'Sensitive', value: 'sensitive' },
    { label: 'Dry / Depleted', value: 'dry' },
    { label: 'Oily / Balanced', value: 'oily' },
    { label: 'Mature', value: 'mature' },
  ];

  const sortOptions = [
    { label: 'Newest Arrivals', value: '-createdAt' },
    { label: 'Price: Low to High', value: 'price' },
    { label: 'Price: High to Low', value: '-price' },
    { label: 'Highest Rated', value: '-ratingsAverage' },
  ];

  return (
    <aside className="w-full lg:w-64 space-y-8 pr-0 lg:pr-6 border-b lg:border-b-0 lg:border-r border-velora-border pb-8 lg:pb-0">
      <div className="flex items-center justify-between pb-4 border-b border-velora-border">
        <h3 className="font-serif text-sm tracking-luxury uppercase text-velora-primary">
          Filter Rituals
        </h3>
        <button
          onClick={onReset}
          className="text-[11px] text-velora-muted hover:text-velora-primary flex items-center gap-1 uppercase tracking-wider transition-colors"
        >
          <RotateCcw size={11} />
          <span>Reset</span>
        </button>
      </div>

      {/* Sorting */}
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-luxury text-velora-muted font-medium">
          Sort By
        </label>
        <select
          value={filters.sort || '-createdAt'}
          onChange={(e) => onFilterChange('sort', e.target.value)}
          className="w-full bg-stone-50 border border-velora-border text-xs text-velora-primary py-2.5 px-3 focus:outline-none focus:border-velora-emerald font-sans"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Facet */}
      <div className="space-y-3">
        <span className="block text-xs uppercase tracking-luxury text-velora-muted font-medium">
          Category
        </span>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onFilterChange('category', cat.value)}
              className={`block w-full text-left text-xs transition-colors ${
                filters.category === cat.value
                  ? 'text-velora-emerald font-medium underline underline-offset-4'
                  : 'text-stone-600 hover:text-velora-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Type Facet */}
      <div className="space-y-3">
        <span className="block text-xs uppercase tracking-luxury text-velora-muted font-medium">
          Skin Complexion
        </span>
        <div className="space-y-2">
          {skinTypes.map((st) => (
            <button
              key={st.value}
              onClick={() => onFilterChange('skinType', st.value)}
              className={`block w-full text-left text-xs transition-colors ${
                filters.skinType === st.value
                  ? 'text-velora-emerald font-medium underline underline-offset-4'
                  : 'text-stone-600 hover:text-velora-primary'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Cap Filter */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs uppercase tracking-luxury text-velora-muted">
          <span>Max Price</span>
          <span className="font-mono text-velora-primary">${filters.maxPrice || 120}</span>
        </div>
        <input
          type="range"
          min="30"
          max="150"
          step="5"
          value={filters.maxPrice || 120}
          onChange={(e) => onFilterChange('maxPrice', e.target.value)}
          className="w-full accent-velora-emerald cursor-pointer"
        />
      </div>
    </aside>
  );
};