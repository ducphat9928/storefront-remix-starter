import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { CurrencyCode, ProductVariant } from '~/generated/graphql';
import { SvgPreviousProductGrid } from '../@svg/SvgPreviousProductGrid';
import { SvgNextProductGrid } from '../@svg/SvgNextProductGrid';

interface PaginatedProductGridProps {
  variants: ProductVariant[];
}

const PaginatedProductGrid: React.FC<PaginatedProductGridProps> = ({ variants }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const uniqueVariants = Array.from(
    new Map(variants.map((variant) => [variant.product.slug, variant])).values()
  );

  const totalPages = Math.ceil(uniqueVariants.length / itemsPerPage);
  const paginatedVariants = uniqueVariants.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page > totalPages ? 1 : page);
  };

  return (
    <div className="relative group">
      {/* Nút Previous */}
      <button
        aria-label="Previous page"
        className={`
  absolute top-1/3 left-0 -translate-y-1/2 z-40
  w-9 h-12 flex items-center justify-center
  bg-[black] text-white border border-gray-700 rounded-md shadow-md
  transform transition-all duration-300
  opacity-0 invisible pointer-events-none -translate-x-full group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-x-0 hover:bg-gray-800
`}
        onClick={() => goToPage(currentPage - 1)}
      >
        <SvgPreviousProductGrid />
      </button>

      {/* Grid sản phẩm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {paginatedVariants.map((variant) => (
          <ProductCard
            key={variant.id}
            productId={variant?.product?.id}
            productAsset={
              variant.product.featuredAsset
                ? { id: variant?.id, preview: variant.product?.featuredAsset?.preview }
                : undefined
            }
            productName={variant.product?.name}
            slug={variant.product?.slug}
            priceWithTax={{ value: variant?.price }}
            currencyCode={CurrencyCode.Vnd}
          />
        ))}
      </div>

      {/* Nút Next */}
      <button
        aria-label="Next page"
        className={`
          absolute top-1/3 right-0 -translate-y-1/2 z-40
          w-9 h-12 flex items-center justify-center
          bg-[black] text-white border border-gray-700 rounded-md shadow-md
          transform transition-all duration-300
          opacity-0 invisible pointer-events-none translate-x-full group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto group-hover:translate-x-0 hover:bg-gray-800
        `}
        onClick={() => goToPage(currentPage + 1)}
      >
        <SvgNextProductGrid />
      </button>

      {/* Dấu chấm trang */}
      <div
        className="
          flex justify-center mt-6 space-x-2
          opacity-0 group-hover:opacity-100
          transform translate-y-4 group-hover:translate-y-0
          transition-all duration-300
        "
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={`w-3 h-3 rounded-full ${
              i + 1 === currentPage ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PaginatedProductGrid;
