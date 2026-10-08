import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import FilterSidebar from '../components/common/FilterSidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../api/axios';
import { SlidersHorizontal, ArrowUpDown, Sparkles, AlertCircle, X } from 'lucide-react';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [facets, setFacets] = useState({});
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Read current filters from URL params
  const currentFilters = {
    search: searchParams.get('search') || '',
    collection: searchParams.get('collection') || '',
    color: searchParams.get('color') || '',
    size: searchParams.get('size') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    fabric: searchParams.get('fabric') || '',
    neckStyle: searchParams.get('neckStyle') || '',
    discount: searchParams.get('discount') || '',
    sort: searchParams.get('sort') || 'newest',
    page: searchParams.get('page') || '1',
  };

  // Fetch Collections list for filters
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get('/collections');
        setCollections(res.data.collections || []);
      } catch (err) {
        console.error('Failed to load collections:', err.message);
      }
    };
    fetchCollections();
  }, []);

  // Fetch Products based on URL query
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', {
        params: searchParams,
      });
      setProducts(res.data.products || []);
      setTotalProducts(res.data.totalProducts || 0);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || 1);
      if (res.data.facets) {
        setFacets(res.data.facets);
      }
    } catch (err) {
      console.error('Failed to load products:', err.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    // Reset to page 1 whenever filters change, except for page changes
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    const nextParams = new URLSearchParams();
    if (searchParams.get('collection')) {
      nextParams.set('collection', searchParams.get('collection'));
    }
    setSearchParams(nextParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Breadcrumb & Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-brand-gold/20 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="text-brand-dark font-medium">Ethnic Boutique</span>
            {currentFilters.collection && (
              <>
                <span>/</span>
                <span className="text-brand-magenta font-semibold capitalize">
                  {collections.find((c) => c.slug === currentFilters.collection || c._id === currentFilters.collection)?.name ||
                    currentFilters.collection}
                </span>
              </>
            )}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark flex items-center gap-2">
            <span>Festive Kurta Sets</span>
            <span className="text-xs font-sans font-normal text-gray-500 bg-brand-cream border border-brand-gold/30 px-2.5 py-0.5 rounded-full">
              {totalProducts} designs
            </span>
          </h1>
        </div>

        {/* Controls: Mobile Filter Button & Sort Dropdown */}
        <div className="flex items-center gap-3">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-brand-dark hover:bg-gray-50"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-magenta" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort By:</span>
            <select
              value={currentFilters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white font-medium text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-magenta focus:border-brand-magenta"
            >
              <option value="newest">Newest Launches</option>
              <option value="popularity">Popularity</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Left Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar (3 columns) */}
        <div className="hidden lg:block lg:col-span-3 sticky top-24 bg-white rounded-xl border border-brand-gold/20 p-5 shadow-sm">
          <FilterSidebar
            collections={collections}
            facets={facets}
            selectedFilters={currentFilters}
            onFilterChange={updateFilter}
            onClearAll={clearAllFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 transition-opacity"
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl flex flex-col">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-brand-cream">
                <span className="font-serif font-bold text-base text-brand-dark">Filters</span>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-md text-gray-500 hover:text-brand-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto">
                <FilterSidebar
                  collections={collections}
                  facets={facets}
                  selectedFilters={currentFilters}
                  onFilterChange={updateFilter}
                  onClearAll={clearAllFilters}
                  isMobileDrawer
                  onCloseMobileDrawer={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Products Grid (9 columns) */}
        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-brand-gold/20 p-8 shadow-sm">
              <AlertCircle className="w-12 h-12 text-brand-gold mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-brand-dark">
                No matching designs found
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto font-sans">
                Try loosening your filters or clearing search terms to explore our other festive kurta sets.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-5 px-6 py-2.5 bg-brand-magenta text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-brand-magenta-dark transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateFilter('page', String(currentPage - 1))}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-white text-brand-dark hover:bg-brand-cream disabled:opacity-40 transition-colors"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => updateFilter('page', String(pageNum))}
                        className={`w-9 h-9 text-xs font-bold rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-brand-magenta text-white shadow-sm'
                            : 'bg-white border border-gray-300 text-brand-dark hover:bg-brand-cream'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateFilter('page', String(currentPage + 1))}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-300 bg-white text-brand-dark hover:bg-brand-cream disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
