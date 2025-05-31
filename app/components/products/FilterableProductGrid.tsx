import FacetFilterControls from '~/components/facet-filter/FacetFilterControls';
import { ProductCard } from '~/components/products/ProductCard';
import { translatePaginationFrom, translatePaginationTo } from '~/utils/pagination';
import { Pagination } from '~/components/Pagination';
import { NoResultsHint } from '~/components/products/NoResultsHint';
import { useRef } from 'react';
import { FacetFilterTracker } from '~/components/facet-filter/facet-filter-tracker';
import { filteredSearchLoaderFromPagination } from '~/utils/filtered-search-loader';
import { useTranslation } from 'react-i18next';

export function FilterableProductGrid({
  result,
  resultWithoutFacetValueFilters,
  facetValueIds,
  appliedPaginationPage,
  appliedPaginationLimit,
  allowedPaginationLimits,
  mobileFiltersOpen,
  setMobileFiltersOpen,
}: Awaited<
  ReturnType<ReturnType<typeof filteredSearchLoaderFromPagination>['filteredSearchLoader']>
> & {
  allowedPaginationLimits: Set<number>;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (arg0: boolean) => void;
}) {
  const { t } = useTranslation();
  const facetValuesTracker = useRef(new FacetFilterTracker());
  facetValuesTracker.current.update(result, resultWithoutFacetValueFilters, facetValueIds);

  return (
    <div className="flex flex-col sm:flex-row gap-6 mt-6">
      {/* Sidebar Filters */}
      <aside className="sm:w-64 w-full">
        <FacetFilterControls
          facetFilterTracker={facetValuesTracker.current}
          mobileFiltersOpen={mobileFiltersOpen}
          setMobileFiltersOpen={setMobileFiltersOpen}
        />
      </aside>

      {/* Main Product Grid */}
      <main className="flex-1 space-y-6">
        {result.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {result.items.map((item) => (
                <ProductCard key={item.productId} {...item} />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <span className="text-gray-600 text-sm">
                {t('product.showing')}{' '}
                {translatePaginationFrom(appliedPaginationPage, appliedPaginationLimit)}{' '}
                {t('product.to')}{' '}
                {translatePaginationTo(
                  appliedPaginationPage,
                  appliedPaginationLimit,
                  result.totalItems
                )}{' '}
                {t('product.of')} {result.totalItems} {t('product.results')}
              </span>
              <Pagination
                appliedPaginationLimit={appliedPaginationLimit}
                allowedPaginationLimits={allowedPaginationLimits}
                totalItems={result.totalItems}
                appliedPaginationPage={appliedPaginationPage}
              />
            </div>
          </>
        ) : (
          <NoResultsHint facetFilterTracker={facetValuesTracker.current} className="p-6" />
        )}
      </main>
    </div>
  );
}
