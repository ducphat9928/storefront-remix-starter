import { Link } from '@remix-run/react';
import { Price } from './Price';
import { SearchQuery } from '~/generated/graphql';
import { SvgMagnifyingGlass } from '../@svg/SvgMagnifyingGlass';

export type ProductCardProps = SearchQuery['search']['items'][number];

export function ProductCard({
  productAsset,
  productName,
  slug,
  priceWithTax,
  currencyCode,
}: ProductCardProps) {
  return (
    <Link
      className="flex flex-col group relative bg-white p-2 rounded-md shadow hover:shadow-md transition"
      prefetch="intent"
      to={`/products/${slug}`}
    >
      <div className="relative overflow-hidden rounded-md">
        <img
          className={`w-full h-48 object-cover transform-gpu transition-transform duration-300 ease-in-out ${
            productName ? 'group-hover:scale-105' : ''
          }`}
          src={productAsset?.preview + '?w=300&h=400'}
          alt={productName}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-gray/30">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl font-bold text-gray">
            <SvgMagnifyingGlass />
          </div>
        </div>
      </div>

      <div className="mt-2 text-[14px] text-gray-600 font-semibold leading-5 line-clamp-2 min-h-[40px]">
        {productName}
      </div>

      <div className="mt-1 text-[16px] font-bold">
        <Price priceWithTax={priceWithTax} currencyCode={currencyCode} />
      </div>
    </Link>
  );
}
