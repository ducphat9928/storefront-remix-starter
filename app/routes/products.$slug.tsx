import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { useEffect, useState } from 'react';
import { Price } from '~/components/products/Price';
import { getProductBySlug, search } from '~/providers/products/products';
import {
  FetcherWithComponents,
  ShouldRevalidateFunction,
  useLoaderData,
  useOutletContext,
  MetaFunction,
  Link,
} from '@remix-run/react';
import { CheckIcon, HeartIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { Breadcrumbs } from '~/components/Breadcrumbs';
import { APP_META_TITLE } from '~/constants';
import { CartLoaderData } from '~/routes/api.active-order';
import { getSessionStorage } from '~/sessions';
import { ErrorCode, ErrorResult } from '~/generated/graphql';
import Alert from '~/components/Alert';
import { StockLevelLabel } from '~/components/products/StockLevelLabel';
import TopReviews from '~/components/products/TopReviews';
import { ScrollableContainer } from '~/components/products/ScrollableContainer';
import { useTranslation } from 'react-i18next';
import { SvgCar } from '~/components/@svg/SvgCar';
import { SvgReturnItem } from '~/components/@svg/SvgReturnItem';
import { SvgCart } from '~/components/@svg/SvgCart';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import Tooltip from '~/components/Tooltip';

export const meta: MetaFunction = ({ data }) => {
  return [
    {
      title: data?.product?.name
        ? `${data.product.name} - ${APP_META_TITLE}`
        : APP_META_TITLE,
    },
  ];
};
export async function loader({ params, request }: DataFunctionArgs) {
  const { product } = await getProductBySlug(params.slug!, { request });
  if (!product) {
    throw new Response('Not Found', {
      status: 404,
    });
  }
  const searchByFacet = await search({
    input: {
      facetValueFilters: [
        {
          or: product?.facetValues.map((facet) => facet.id) || [],
        },
      ],
    },
  });
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request?.headers.get('Cookie'),
  );
  const error = session.get('activeOrderError');
  return json(
    { product: product!, error, searchByFacet },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    },
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

export default function ProductSlug() {
  const { product, error, searchByFacet } = useLoaderData<typeof loader>();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || '',
  );
  const [featuredAsset, setFeaturedAsset] = useState(
    product.variants[0]?.featuredAsset,
  );

  const { activeOrderFetcher } = useOutletContext<{
    activeOrderFetcher: FetcherWithComponents<CartLoaderData>;
  }>();
  const { activeOrder } = activeOrderFetcher.data ?? {};
  const addItemToOrderError = getAddItemToOrderError(error);
  const { t } = useTranslation();

  if (!product) {
    return <div>{t('product.notFound')}</div>;
  }
  const [isExpanded, setIsExpanded] = useState(false);

  const truncatedDescription =
    product.description.length > 300
      ? product.description.slice(0, 300) + '...'
      : product.description;

  const findVariantById = (id: string) =>
    product.variants.find((v) => v.id === id);

  const selectedVariant = findVariantById(selectedVariantId);
  if (!selectedVariant) {
    setSelectedVariantId(product.variants[0].id);
  }

  const qtyInCart =
    activeOrder?.lines.find((l) => l.productVariant.id === selectedVariantId)
      ?.quantity ?? 0;

  useEffect(() => {
    if (product.variants.length > 0) {
      setSelectedVariantId(product.variants[0]?.id);
      setFeaturedAsset(product.variants[0]?.featuredAsset);
    }
  }, [product.variants]);
  return (
    <div>
      <div className="max-w-7xl mx-auto p-4">
        <Breadcrumbs
          items={
            product.collections[product.collections.length - 1]?.breadcrumbs ??
            []
          }
          nameProduct={product.name}
        ></Breadcrumbs>
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-4 md:mt-12">
          <div className="w-full max-w-2xl mx-auto sm:block lg:max-w-none">
            <span className="rounded-md overflow-hidden">
              <div className="w-full h-[400px] object-center object-cover rounded-lg w-[90%] ml-auto">
                <img
                  src={
                    (featuredAsset?.preview || product.featuredAsset?.preview) +
                    '?w=800'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </span>

            {product.variants.length > 1 && (
              <ScrollableContainer>
                {[
                  selectedVariantId &&
                    product.variants
                      .find((variant) => variant.id === selectedVariantId)
                      ?.assets.map((asset) => (
                        <div
                          key={asset.id}
                          className={`flex justify-center items-center rounded-lg cursor-pointer w-[110px] h-[110px] bg-center bg-no-repeat bg-contain relative m-[5px_6px] shadow-[0_0_0_1px_var(--colorCC)] transition-all ${
                            featuredAsset?.id === asset.id
                              ? 'border-2 border-blue-500'
                              : ''
                          }`}
                          onMouseEnter={() => {
                            setFeaturedAsset(asset);
                          }}
                        >
                          <img
                            draggable="false"
                            className="object-contain w-full h-full select-none"
                            src={asset.preview + '?preset=full'}
                            alt="Asset"
                          />
                        </div>
                      )),
                ]}
              </ScrollableContainer>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div>
              <div className="bg-green-500 text-white rounded-full shadow-md text-sm font-bold leading-5 m-0 mr-1 mb-1 px-3 py-1 inline-block">
                Giá tốt nhất
              </div>
              <h5 className="mt-2 text-[20px] leading-[28px] font-semibold py-[2px] pb-[7px] text-left block w-full capitalize text-[rgb(0,2,4)]">
                {product.name}
              </h5>
            </div>
            <activeOrderFetcher.Form method="post" action="/api/active-order">
              <input type="hidden" name="action" value="addItemToOrder" />
              <div className="mt-2 mb-4 flex flex-col sm:flex-row sm:items-center">
                <p className="text-[var(--color20)] text-[24px] font-[var(--fontSemiBold)] leading-[32px] mr-4 whitespace-nowrap">
                  <Price
                    priceWithTax={selectedVariant?.priceWithTax}
                    currencyCode={selectedVariant?.currencyCode}
                  />
                </p>
              </div>

              <div className="flex items-center  mb-2.5">
                <div className="font-normal text-sm text-gray-800">
                  Lựa chọn:
                </div>
                <div className="font-light text-sm text-gray-500 px-1">
                  {selectedVariant?.name}
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,_40px)] mb-2">
                {product.variants.map((variant, index) => (
                  <Tooltip key={index} content={variant.name}>
                    <div
                      className={`rounded cursor-pointer flex h-9 mr-0.5 mt-1 min-w-[28px] p-[1px] relative transition-[opacity] w-9 ${
                        selectedVariantId === variant.id
                          ? 'border border-solid border-black'
                          : ''
                      }`}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        const selectedVariant = findVariantById(variant.id);
                        if (selectedVariant) {
                          setFeaturedAsset(selectedVariant.featuredAsset);
                        }
                      }}
                    >
                      <img
                        src={variant.featuredAsset?.preview}
                        alt={`Variant ${index}`}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>
              <div className="border border-solid border-[#f0f2f5] flex rounded-md">
                <div className="flex items-center justify-start flex-1 p-[10px_5px_16px] flex-col">
                  <div className="h-[30px] w-[30px]">
                    <SvgReturnItem />
                  </div>
                  <div
                    className="text-[12px] font-light leading-[20px] tracking-[0] text-center"
                    style={{
                      color: 'var(--color20)',
                      fontWeight: 'var(--fontLight)',
                    }}
                  >
                    <div className="text-[12px] font-semibold leading-[20px] align-middle">
                      Miễn phí giao hàng
                    </div>
                    với đơn hàng
                    <div className="text-[12px] font-semibold leading-[20px] align-middle">
                      <span>tại Gia Lai</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start flex-1 p-[10px_5px_16px] flex-col">
                  <div className="h-[30px] w-[17px]">
                    <SvgCar />
                  </div>
                  <div className="text-[12px] font-light leading-[20px] tracking-[0] text-center">
                    Đổi trả hàng trong
                    <div className="text-[12px] font-semibold leading-[20px] align-middle">
                      7 ngày
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex sm:flex-col1 align-baseline">
                <button
                  type="submit"
                  className={`max-w-xs flex-1 bg-green-500 text-white h-11 
    ${activeOrderFetcher.state !== 'idle' ? 'opacity-50' : 'hover:bg-green-600'}
    transition-colors border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-green-500 sm:w-full`}
                  disabled={activeOrderFetcher.state !== 'idle'}
                >
                  {qtyInCart ? (
                    <span className="flex items-center">
                      <CheckIcon className="w-4 h-4 mr-1" /> {qtyInCart}{' '}
                      {t('product.inCart')}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ShoppingBagIcon className="w-5 h-5 mr-1" />
                      Thêm vào giỏ
                    </span>
                  )}
                </button>
              </div>
              {addItemToOrderError && (
                <div className="mt-4">
                  <Alert message={addItemToOrderError} />
                </div>
              )}
            </activeOrderFetcher.Form>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t('product.description')}
        </h3>
        <div>
          <div
            className={`text-base text-gray-700 ${
              isExpanded ? '' : 'truncate'
            }`}
            style={{
              WebkitLineClamp: isExpanded ? 'unset' : 4,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
            }}
            dangerouslySetInnerHTML={{
              __html: isExpanded ? truncatedDescription : product.description,
            }}
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-500 mt-2"
          >
            {isExpanded ? t('product.seeLess') : t('product.seeMore')}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Sản phẩm liên quan
        </h3>
        {/* check */}
        <div className="related-products-container flex overflow-x-auto space-x-4">
          {searchByFacet.search.collections.map((collection, index) => {
            const allProductIds = new Set(
              searchByFacet.search.collections.flatMap((col) =>
                col.collection.productVariants.items.map(
                  (item) => item.product.id,
                ),
              ),
            );

            return (
              <div
                key={index}
                className="related-products-container flex overflow-x-auto space-x-4"
              >
                {collection.collection.productVariants.items
                  .filter(
                    (variant, variantIndex, self) =>
                      variant.product.slug !== product.slug &&
                      self.findIndex(
                        (v) => v.product.id === variant.product.id,
                      ) === variantIndex &&
                      allProductIds.has(variant.product.id) === false,
                  )
                  .map((variant, variantIndex) => (
                    <Link
                      key={variantIndex}
                      className="flex flex-col"
                      prefetch="intent"
                      to={`/products/${variant.product.slug}`}
                    >
                      <div className="w-[250px] h-[350px] flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden shadow-md">
                        <img
                          src={variant.featuredAsset?.preview}
                          alt={variant.name || `Product ${index}`}
                          className="w-full h-[200px] object-cover rounded-t-lg"
                        />
                        <div className="p-4 h-[150px] flex flex-col justify-between">
                          <h4 className="text-lg font-semibold">
                            {variant.name}
                          </h4>
                          <p className="text-gray-600">
                            Price:{' '}
                            {variant.priceWithTax
                              ? `$${variant.priceWithTax}`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto px-2 pt-5">
      <h2 className="text-3xl sm:text-5xl font-light tracking-tight text-gray-900 my-8">
        {t('product.notFound')}
      </h2>
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start mt-4 md:mt-12">
        <div className="w-full max-w-2xl mx-auto sm:block lg:max-w-none">
          <span className="rounded-md overflow-hidden">
            <div className="w-full h-96 bg-slate-200 rounded-lg flex content-center justify-center">
              <PhotoIcon className="w-48 text-white"></PhotoIcon>
            </div>
          </span>
        </div>

        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
          <div className="">{t('product.notFoundInfo')}</div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-2 bg-slate-200 rounded"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                <div className="h-2 bg-slate-200 rounded col-span-1"></div>
              </div>
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAddItemToOrderError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderModificationError:
    case ErrorCode.OrderLimitError:
    case ErrorCode.NegativeQuantityError:
    case ErrorCode.InsufficientStockError:
      return error.message;
  }
}
