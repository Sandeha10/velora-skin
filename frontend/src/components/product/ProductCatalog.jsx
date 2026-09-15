import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../../services/api';
import { ProductCard } from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { FilterSidebar } from './FilterSidebar';
import { ProductDetailModal } from './ProductDetailModal';
import { SlidersHorizontal } from 'lucide-react';

export const ProductCatalog = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    skinType: '',
    maxPrice: '',
    sort: '-createdAt',
  });

  // TanStack Query with Reactive Cache Key based on filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const params = { sort: filters.sort };

      if (filters.category) params.category = filters.category;
      if (filters.skinType) params.skinType = filters.skinType;
      if (filters.maxPrice) params['price[lte]'] = filters.maxPrice;

      return await fetchProducts(params);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache retention
  });

  const products = data?.data?.products || [];
  const totalRecords = data?.totalRecords || 0;

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      skinType: '',
      maxPrice: '',
      sort: '-createdAt',
    });
  };

  return (
    <section id="catalog" className="py-12 border-t border-velora-border">
      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Section Headline */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
        <div>
          <span className="text-[11px] uppercase tracking-editorial text-velora-emerald font-medium block mb-2">
            The Botanical Archive
          </span>
          <h2 className="font-serif text-3xl text-velora-primary font-normal">
            Pure Clinical Formulations
          </h2>
        </div>
        <span className="text-xs text-velora-muted font-mono mt-3 sm:mt-0">
          Showing {products.length} of {totalRecords} Formulations
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filter Sidebar */}
        <FilterSidebar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Product Grid Area */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-16 bg-rose-50 border border-rose-200 text-xs text-rose-800">
              Failed to synchronize botanical formulations. Please ensure the backend server is active.
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 border border-velora-border">
              <SlidersHorizontal size={24} className="mx-auto text-velora-muted mb-3 opacity-50" />
              <h3 className="font-serif text-lg text-velora-primary mb-1">
                No matching formulations found
              </h3>
              <p className="text-xs text-velora-muted max-w-sm mx-auto mb-6">
                Try widening your price parameter or selecting a different skin complexion filter.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs uppercase tracking-luxury border border-velora-primary px-5 py-2.5 hover:bg-velora-primary hover:text-white transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id || product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="cursor-pointer group"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};