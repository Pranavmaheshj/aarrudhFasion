import React, { useState } from 'react';
import { ChevronDown, ChevronUp, X, RotateCcw } from 'lucide-react';

const FilterAccordion = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-brand-borderWarm/70 py-3.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs font-bold tracking-wider uppercase text-brand-dark hover:text-brand-magenta transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
};

const FilterSidebar = ({
  collections = [],
  facets = {},
  selectedFilters,
  onFilterChange,
  onClearAll,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  // Preset color swatches map for Indian ethnic wear
  const colorSwatchHex = {
    'Teal Blue': '#008080',
    'Sky Blue': '#87CEEB',
    'Rose Brown': '#BC8F8F',
    'Crimson Red': '#DC143C',
    'Cream': '#FFFDD0',
    'Rust Red': '#B7410E',
    'Royal Blue': '#4169E1',
    'Violet': '#8A2BE2',
    'Wine': '#722F37',
    'Lilac': '#C8A2C8',
    'Peach': '#FFDAB9',
    'Turquoise': '#40E0D0',
    'Pale Yellow': '#FFFF99',
    'Blush Pink': '#FFD1DC',
    'Peacock Blue': '#005F73',
    'Teal Green': '#006D77',
    'Purple': '#800080',
    'Maroon': '#800000',
    'Magenta': '#C2185B',
  };

  const handleCheckboxToggle = (filterKey, value) => {
    const currentValues = selectedFilters[filterKey]
      ? selectedFilters[filterKey].split(',').filter(Boolean)
      : [];

    const index = currentValues.indexOf(value);
    let updated;
    if (index > -1) {
      updated = currentValues.filter((v) => v !== value);
    } else {
      updated = [...currentValues, value];
    }
    onFilterChange(filterKey, updated.join(','));
  };

  const isChecked = (filterKey, value) => {
    if (!selectedFilters[filterKey]) return false;
    return selectedFilters[filterKey].split(',').includes(value);
  };

  return (
    <div className={`bg-white rounded-xl border border-brand-borderWarm p-4 ${isMobileDrawer ? 'h-full overflow-y-auto' : ''}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between pb-3 border-b border-brand-borderWarm">
        <h2 className="font-serif font-bold text-sm tracking-wider uppercase text-brand-dark">
          Refine By
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-magenta hover:text-brand-magentaDark uppercase tracking-wider"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
          {isMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 text-gray-500 hover:text-black ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 1. Collection Filter */}
      <FilterAccordion title="Collection">
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-brand-magenta">
            <input
              type="radio"
              name="collectionFilter"
              checked={!selectedFilters.collection || selectedFilters.collection === 'all'}
              onChange={() => onFilterChange('collection', '')}
              className="text-brand-magenta focus:ring-brand-magenta"
            />
            <span>All Collections</span>
          </label>
          {collections.map((col) => (
            <label key={col._id} className="flex items-center justify-between text-xs text-gray-700 cursor-pointer hover:text-brand-magenta">
              <div className="flex items-center gap-2 truncate">
                <input
                  type="radio"
                  name="collectionFilter"
                  checked={selectedFilters.collection === col.slug || selectedFilters.collection === col._id}
                  onChange={() => onFilterChange('collection', col.slug)}
                  className="text-brand-magenta focus:ring-brand-magenta"
                />
                <span className="truncate">{col.name}</span>
              </div>
              {col.productCount !== undefined && (
                <span className="text-[10px] text-gray-400">({col.productCount})</span>
              )}
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* 2. Color Swatches */}
      <FilterAccordion title="Color">
        <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
          {(facets.colors || [
            'Teal Blue', 'Sky Blue', 'Rose Brown', 'Crimson Red', 'Cream', 'Rust Red',
            'Royal Blue', 'Violet', 'Wine', 'Lilac', 'Peach', 'Turquoise', 'Pale Yellow',
            'Blush Pink', 'Peacock Blue', 'Teal Green', 'Purple', 'Maroon', 'Magenta'
          ]).map((col) => {
            const checked = isChecked('color', col);
            const hex = colorSwatchHex[col] || '#999999';
            return (
              <label
                key={col}
                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs border transition-colors ${
                  checked ? 'border-brand-magenta bg-brand-magenta/5 text-brand-magenta font-semibold' : 'border-gray-100 hover:border-brand-borderWarm'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleCheckboxToggle('color', col)}
                  className="hidden"
                />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs shrink-0"
                  style={{ backgroundColor: hex }}
                />
                <span className="truncate text-[11px]">{col}</span>
              </label>
            );
          })}
        </div>
      </FilterAccordion>

      {/* 3. Sizes (S, M, L, XL, XXL) */}
      <FilterAccordion title="Size">
        <div className="flex flex-wrap gap-2">
          {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
            const checked = isChecked('size', sz);
            return (
              <button
                key={sz}
                type="button"
                onClick={() => handleCheckboxToggle('size', sz)}
                className={`w-9 h-9 text-xs font-semibold rounded border transition-all ${
                  checked
                    ? 'border-brand-magenta bg-brand-magenta text-white shadow-sm'
                    : 'border-brand-borderWarm bg-white text-brand-dark hover:border-brand-gold'
                }`}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </FilterAccordion>

      {/* 4. Price Slider */}
      <FilterAccordion title="Price (₹)">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-dark">
            <span>₹{selectedFilters.minPrice || 2000}</span>
            <span>₹{selectedFilters.maxPrice || 8000}</span>
          </div>
          <input
            type="range"
            min="1000"
            max="8000"
            step="200"
            value={selectedFilters.maxPrice || 8000}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-full accent-brand-magenta cursor-pointer"
          />
          <div className="text-[11px] text-gray-500 text-center">
            Max Budget: ₹{Number(selectedFilters.maxPrice || 8000).toLocaleString('en-IN')}
          </div>
        </div>
      </FilterAccordion>

      {/* 5. Fabric Filter */}
      <FilterAccordion title="Fabric">
        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
          {['Pure Tissue Silk', 'Chanderi Silk', 'Silk Blend', 'Georgette', 'Banarasi Silk Blend'].map(
            (fab) => (
              <label key={fab} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-brand-magenta">
                <input
                  type="checkbox"
                  checked={isChecked('fabric', fab)}
                  onChange={() => handleCheckboxToggle('fabric', fab)}
                  className="rounded border-gray-300 text-brand-magenta focus:ring-brand-magenta"
                />
                <span className="truncate">{fab}</span>
              </label>
            )
          )}
        </div>
      </FilterAccordion>

      {/* 6. Neck Style */}
      <FilterAccordion title="Neckline &amp; Yoke">
        <div className="space-y-1.5">
          {['Round Neck', 'V-Neck', 'Keyhole Neck', 'Embroidered Yoke'].map((neck) => (
            <label key={neck} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-brand-magenta">
              <input
                type="checkbox"
                checked={isChecked('neckStyle', neck)}
                onChange={() => handleCheckboxToggle('neckStyle', neck)}
                className="rounded border-gray-300 text-brand-magenta focus:ring-brand-magenta"
              />
              <span>{neck}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>

      {/* 7. Discount Filter */}
      <FilterAccordion title="Discount">
        <div className="space-y-1.5 text-xs text-gray-700">
          {[
            { label: '30% and above', val: '30' },
            { label: '40% and above', val: '40' },
            { label: '50% and above', val: '50' },
          ].map((d) => (
            <label key={d.val} className="flex items-center gap-2 cursor-pointer hover:text-brand-magenta">
              <input
                type="radio"
                name="discountFilter"
                checked={selectedFilters.discount === d.val}
                onChange={() => onFilterChange('discount', d.val)}
                className="text-brand-magenta focus:ring-brand-magenta"
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </FilterAccordion>
    </div>
  );
};

export default FilterSidebar;
