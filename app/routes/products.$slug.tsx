import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { useState } from 'react';
import { Price } from '~/components/products/Price';
import { getProductBySlug } from '~/providers/products/products';
import {
  FetcherWithComponents,
  ShouldRevalidateFunction,
  useLoaderData,
  useOutletContext,
  MetaFunction,
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
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request?.headers.get('Cookie'),
  );
  const error = session.get('activeOrderError');
  return json(
    { product: product!, error },
    {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    },
  );
}

export const shouldRevalidate: ShouldRevalidateFunction = () => true;

export default function ProductSlug() {
  const { product, error } = useLoaderData<typeof loader>();
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

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0].id,
  );
  const selectedVariant = findVariantById(selectedVariantId);
  if (!selectedVariant) {
    setSelectedVariantId(product.variants[0].id);
  }

  const qtyInCart =
    activeOrder?.lines.find((l) => l.productVariant.id === selectedVariantId)
      ?.quantity ?? 0;

  const asset = product.assets[0];
  const brandName = product.facetValues.find(
    (fv) => fv.facet.code === 'brand',
  )?.name;

  const [featuredAsset, setFeaturedAsset] = useState(
    selectedVariant?.featuredAsset,
  );

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
          {/* Image gallery */}
          <div className="w-full max-w-2xl mx-auto sm:block lg:max-w-none">
            <span className="rounded-md overflow-hidden">
              <div className="w-full h-full object-center object-cover rounded-lg">
                <img
                  src={
                    (featuredAsset?.preview || product.featuredAsset?.preview) +
                    '?w=800'
                  }
                  alt={product.name}
                  className="w-full h-full object-center object-cover rounded-lg"
                />
              </div>
            </span>

            {product.assets.length > 1 && (
              <ScrollableContainer>
                {product.assets.map((asset) => (
                  <div
                    className={`basis-1/3 md:basis-1/4 flex-shrink-0 select-none touch-pan-x rounded-lg ${
                      featuredAsset?.id == asset.id
                        ? 'outline outline-2 outline-primary outline-offset-[-2px]'
                        : ''
                    }`}
                    onClick={() => {
                      setFeaturedAsset(asset);
                    }}
                  >
                    <img
                      draggable="false"
                      className="rounded-lg select-none h-24 w-full object-cover"
                      src={
                        asset.preview +
                        '?preset=full' /* not ideal, but technically prevents loading 2 separate images */
                      }
                    />
                  </div>
                ))}
              </ScrollableContainer>
            )}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div>
              <div className="bg-green-500 text-white rounded-full shadow-md text-sm font-bold leading-5 m-0 mr-1 mb-1 px-3 py-1 inline-block">
                Giá tốt nhất
              </div>
              {/* <h3 className="sr-only">{t('product.description')}</h3> */}
              <h5 className="mt-2 text-[20px] leading-[28px] font-semibold py-[2px] pb-[7px] text-left block w-full capitalize text-[rgb(0,2,4)]">
                {product.name}
              </h5>
            </div>
            <activeOrderFetcher.Form method="post" action="/api/active-order">
              <input type="hidden" name="action" value="addItemToOrder" />
              {product.variants.length > 1 ? (
                <div className="mt-4">
                  <label
                    htmlFor="option"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {t('product.selectOption')}
                  </label>
                  <select
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    id="productVariant"
                    value={selectedVariantId}
                    name="variantId"
                    onChange={(e) => {
                      setSelectedVariantId(e.target.value);
                      const variant = findVariantById(e.target.value);
                      if (variant) {
                        setFeaturedAsset(variant!.featuredAsset);
                      }
                    }}
                  >
                    {product.variants.map((variant) => (
                      <option key={variant.id} value={variant.id}>
                        {variant.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input
                  type="hidden"
                  name="variantId"
                  value={selectedVariantId}
                />
              )}

              <div className="mt-2 mb-4 flex flex-col sm:flex-row sm:items-center">
                <p className="text-[var(--color20)] text-[24px] font-[var(--fontSemiBold)] leading-[32px] mr-4 whitespace-nowrap">
                  <Price
                    priceWithTax={selectedVariant?.priceWithTax}
                    currencyCode={selectedVariant?.currencyCode}
                  />
                </p>
                <p className="text-[#8a8d90] text-[16px] font-[var(--fontRegular)] leading-[22px] mb-[2px] mr-3 whitespace-nowrap">
                  (Nội dung của bạn)
                </p>
              </div>
              <div className="flex items-center  mb-2.5">
                <div className="font-normal text-sm text-gray-800">
                  Lựa chọn:
                </div>
                <div className="font-light text-sm text-gray-500 px-1">
                  Mint
                </div>
              </div>
              <div className="grid grid-cols-[repeat(auto-fill,_40px)] mb-2">
                <div className="bg-cover rounded cursor-pointer flex h-9 mr-1 mt-1 min-w-[28px] p-[3px] relative transition-[opacity] w-9 border border-solid"></div>
              </div>

              <div className="border border-solid border-[#f0f2f5] flex rounded-md">
                <div className="flex items-center justify-start flex-1 p-[10px_5px_16px] flex-col">
                  <div className="h-[30px] w-[30px]">
                    <svg
                      viewBox="0 0 60 40"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <path d="M48.6693371,28.5712647 C47.2147119,28.5712647 45.8328179,29.1409929 44.7903364,30.1713525 C43.747855,31.2138339 43.1660049,32.5714842 43.1660049,34.0261094 C43.1660049,35.4807347 43.7357331,36.8383849 44.7903364,37.8808664 C45.8449397,38.911226 47.2147119,39.4809542 48.6693371,39.4809542 C51.6513189,39.4809542 54.0756944,37.032335 54.0756944,34.0261094 C54.0756944,31.0198839 51.6513189,28.5712647 48.6693371,28.5712647 Z M48.6693371,37.0565787 C46.9965181,37.0565787 45.5903803,35.6746847 45.5903803,34.0261094 C45.5903803,32.3775341 46.9965181,30.9956401 48.6693371,30.9956401 C50.3179124,30.9956401 51.6513189,32.3532904 51.6513189,34.0261094 C51.6513189,35.6989285 50.3179124,37.0565787 48.6693371,37.0565787 Z M50.0754749,11.3029771 C49.8572811,11.0969052 49.5663561,10.9878083 49.2633091,10.9878083 L43.0447861,10.9878083 C42.3780828,10.9878083 41.8325984,11.5332928 41.8325984,12.199996 L41.8325984,22.1399353 C41.8325984,22.8066386 42.3780828,23.3521231 43.0447861,23.3521231 L52.9119942,23.3521231 C53.5786974,23.3521231 54.1241819,22.8066386 54.1241819,22.1399353 L54.1241819,15.4850247 C54.1241819,15.1456122 53.9787194,14.8183215 53.7241599,14.5880058 L50.0754749,11.3029771 Z M51.6998064,20.9277476 L44.2569738,20.9277476 L44.2569738,13.4000619 L48.7905559,13.4000619 L51.6998064,16.0183873 L51.6998064,20.9277476 Z M19.0677129,28.5712647 C17.6130876,28.5712647 16.2311936,29.1409929 15.1887122,30.1713525 C14.1462307,31.2138339 13.5643806,32.5714842 13.5643806,34.0261094 C13.5643806,35.4807347 14.1341089,36.8383849 15.1887122,37.8808664 C16.2433155,38.911226 17.6130876,39.4809542 19.0677129,39.4809542 C22.0496947,39.4809542 24.4740702,37.032335 24.4740702,34.0261094 C24.4740702,31.0198839 22.0496947,28.5712647 19.0677129,28.5712647 Z M19.0677129,37.0565787 C17.3948938,37.0565787 15.9887561,35.6746847 15.9887561,34.0261094 C15.9887561,32.3775341 17.3948938,30.9956401 19.0677129,30.9956401 C20.7162882,30.9956401 22.0496947,32.3532904 22.0496947,34.0261094 C22.0496947,35.6989285 20.7162882,37.0565787 19.0677129,37.0565787 Z M10.9824208,30.964662 L8.54592346,30.964662 L8.54592346,27.7402426 C8.54592346,27.0735394 8.00043898,26.5280549 7.33373573,26.5280549 C6.66703248,26.5280549 6.12154801,27.0735394 6.12154801,27.7402426 L6.12154801,32.1768497 C6.12154801,32.843553 6.66703248,33.3890374 7.33373573,33.3890374 L10.9824208,33.3890374 C11.649124,33.3890374 12.1946085,32.843553 12.1946085,32.1768497 C12.1946085,31.5101465 11.649124,30.964662 10.9824208,30.964662 Z M17.1282125,23.4558325 C17.1282125,22.7891292 16.5827281,22.2436447 15.9160248,22.2436447 L1.21218772,22.2436447 C0.545484476,22.2436447 5.15143483e-14,22.7891292 5.15143483e-14,23.4558325 C5.15143483e-14,24.1225357 0.545484476,24.6680202 1.21218772,24.6680202 L15.9160248,24.6680202 C16.5827281,24.6680202 17.1282125,24.1346576 17.1282125,23.4558325 Z M3.67292881,19.9822412 L18.3767659,20.0670943 C19.0434692,20.0670943 19.5889536,19.5337317 19.6010755,18.8670285 C19.6131974,18.1882034 19.0677129,17.6427189 18.4010097,17.6427189 L3.69717256,17.5578658 C3.68505068,17.5578658 3.68505068,17.5578658 3.68505068,17.5578658 C3.01834743,17.5578658 2.47286296,18.0912284 2.47286296,18.7579316 C2.46074108,19.4367567 3.00622556,19.9822412 3.67292881,19.9822412 Z M6.14579176,15.3813153 L20.8496289,15.3813153 C21.5163321,15.3813153 22.0618166,14.8358309 22.0618166,14.1691276 C22.0618166,13.5024244 21.5163321,12.9569399 20.8496289,12.9569399 L6.14579176,12.9569399 C5.47908851,12.9569399 4.93360404,13.5024244 4.93360404,14.1691276 C4.93360404,14.8358309 5.47908851,15.3813153 6.14579176,15.3813153 Z M59.0820297,12.9652127 L50.4027656,5.8198864 C50.1845718,5.6391445 49.9178905,5.5427489 49.6269654,5.5427489 L39.4203448,5.5427489 L39.4203448,1.20494541 C39.4203448,0.54222544 38.8748603,0 38.2081571,0 L7.33373573,0 C6.66703248,0 6.12154801,0.54222544 6.12154801,1.20494541 L6.12154801,9.5731298 C6.12154801,10.2358498 6.66703248,10.7780752 7.33373573,10.7780752 C8.00043898,10.7780752 8.54592346,10.2358498 8.54592346,9.5731298 L8.54592346,2.40989083 L37.0080912,2.40989083 L37.0080912,30.9791466 L27.0681519,30.9791466 C26.4014486,30.9791466 25.8559642,31.521372 25.8559642,32.184092 C25.8559642,32.846812 26.4014486,33.3890374 27.0681519,33.3890374 L41.868964,33.3890374 C42.5356673,33.3890374 43.0811517,32.846812 43.0811517,32.184092 C43.0811517,31.521372 42.5356673,30.9791466 41.868964,30.9791466 L39.4324667,30.9791466 L39.4324667,7.9526397 L49.2026997,7.9526397 L57.1061637,14.459345 L57.0213106,30.9550477 L55.7606353,30.9550477 C55.0939321,30.9550477 54.5484476,31.4972731 54.5484476,32.1599931 C54.5484476,32.8227131 55.0939321,33.3649385 55.7606353,33.3649385 L58.2213764,33.3649385 C58.8880797,33.3649385 59.4335641,32.8347625 59.4335641,32.1720426 L59.5305391,13.9050701 C59.5184173,13.5435865 59.3608329,13.1941523 59.0820297,12.9652127 Z"></path>
                    </svg>
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
                    với đơn hàng trên
                    <div className="text-[12px] font-semibold leading-[20px] align-middle">
                      từ 799k
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-start flex-1 p-[10px_5px_16px] flex-col">
                  <div className="h-[30px] w-[17px]">
                    <svg
                      viewBox="0 0 42 42"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                    >
                      <path
                        d="M29.859375,40.359375 C29.859375,41.265564 29.124939,42 28.21875,42 L8.203125,42 C4.58445742,42 1.640625,39.0561676 1.640625,35.4375 L1.640625,17.2265625 C1.640625,16.3203735 2.37506104,15.5859375 3.28125,15.5859375 C4.18743896,15.5859375 4.921875,16.3203735 4.921875,17.2265625 L4.921875,35.4375 C4.921875,37.2466736 6.3939514,38.71875 8.203125,38.71875 L28.21875,38.71875 C29.124939,38.71875 29.859375,39.453186 29.859375,40.359375 Z M42,4.921875 L42,9.84375 C42,10.749939 41.265564,11.484375 40.359375,11.484375 L40.359375,23.4609375 C40.359375,24.3671265 39.624939,25.1015625 38.71875,25.1015625 C37.812561,25.1015625 37.078125,24.3671265 37.078125,23.4609375 L37.078125,11.484375 L1.640625,11.484375 C0.73443604,11.484375 0,10.749939 0,9.84375 L0,4.921875 C0,2.20779415 2.20779415,0 4.921875,0 L37.078125,0 C39.7922059,0 42,2.20779415 42,4.921875 Z M3.28125,8.203125 L38.71875,8.203125 L38.71875,4.921875 C38.71875,4.01728819 37.9827118,3.28125 37.078125,3.28125 L4.921875,3.28125 C4.01728819,3.28125 3.28125,4.01728819 3.28125,4.921875 L3.28125,8.203125 Z M24.609375,18.046875 C25.515564,18.046875 26.25,17.312439 26.25,16.40625 C26.25,15.500061 25.515564,14.765625 24.609375,14.765625 L17.2265625,14.765625 C16.3203735,14.765625 15.5859375,15.500061 15.5859375,16.40625 C15.5859375,17.312439 16.3203735,18.046875 17.2265625,18.046875 L24.609375,18.046875 Z M34.7402344,27.4804688 L26.0865783,27.4804688 L28.1418457,25.4479523 C28.7862396,24.8106079 28.7920074,23.771759 28.1546631,23.1276855 C27.5176392,22.4836121 26.4787902,22.4775238 25.8347168,23.1148682 L22.7880249,26.127594 C22.0068055,26.9001617 21.5758209,27.9290771 21.5742098,29.0249634 C21.5726166,30.1208496 22.0007172,31.1507264 22.7796936,31.9255371 L25.831192,34.9600525 C26.1516266,35.2785645 26.5697937,35.4375 26.9882813,35.4375 C27.4096527,35.4375 27.8310242,35.276001 28.1517792,34.9536438 C28.7907257,34.3111725 28.7875214,33.272644 28.14505,32.6336975 L26.2628174,30.7617188 L34.7402344,30.7617188 C36.9339295,30.7617188 38.71875,32.5465393 38.71875,34.7402344 C38.71875,36.9339295 36.9544373,38.71875 34.7857361,38.71875 C33.8795471,38.71875 33.1451111,39.453186 33.1451111,40.359375 C33.1451111,41.265564 33.8795471,42 34.7857361,42 C36.7253266,42 38.5428314,41.2424927 39.9027558,39.8671875 C41.2553101,38.4995728 42,36.6788635 42,34.7402344 C42,30.7370453 38.7434234,27.4804688 34.7402344,27.4804688 Z"
                        fill-rule="nonzero"
                      ></path>
                    </svg>
                  </div>
                  <div
                    className="text-[12px] font-light leading-[20px] tracking-[0] text-center"
                    style={{
                      color: 'var(--color20)',
                      fontWeight: 'var(--fontLight)',
                    }}
                  >
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
                  className={`max-w-xs flex-1 ${
                    activeOrderFetcher.state !== 'idle'
                      ? 'bg-gray-400'
                      : qtyInCart === 0
                      ? 'bg-primary-600 hover:bg-primary-700'
                      : 'bg-green-600 active:bg-green-700 hover:bg-green-700'
                  }
              transition-colors border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-primary-500 sm:w-full`}
                  disabled={activeOrderFetcher.state !== 'idle'}
                >
                  {qtyInCart ? (
                    <span className="flex items-center">
                      <CheckIcon className="w-5 h-5 mr-1" /> {qtyInCart}{' '}
                      {t('product.inCart')}
                    </span>
                  ) : (
                    t('product.addToCart')
                  )}
                </button>
              </div>
              {/* <div className="mt-2 flex items-center space-x-2">
                <StockLevelLabel stockLevel={selectedVariant?.stockLevel} />
              </div> */}
              {addItemToOrderError && (
                <div className="mt-4">
                  <Alert message={addItemToOrderError} />
                </div>
              )}

              {/* <section className="mt-12 pt-12 border-t text-xs">
                <h3 className="text-gray-600 font-bold mb-2">
                  {t('product.shippingAndReturns')}
                </h3>
                <div className="text-gray-500 space-y-1">
                  <p>{t('product.shippingInfo')}</p>
                  <p>{t('product.shippingCostsInfo')}</p>
                  <p>{t('product.returnsInfo')}</p>
                </div>
              </section> */}
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

      <div className="max-w-7xl mx-auto p-4 mt-10">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {t('product.details')}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.category')}
            </span>
            <span className="text-gray-500">Shopee</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.subcategory')}
            </span>
            <span className="text-gray-500">Nhà Cửa & Đời Sống</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.roomItem')}
            </span>
            <span className="text-gray-500">Đồ dùng phòng ăn</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.productType')}
            </span>
            <span className="text-gray-500">Bát</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.stock')}
            </span>
            <span className="text-gray-500">8673</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.brand')}
            </span>
            <span className="text-gray-500">Donghwa</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.origin')}
            </span>
            <span className="text-gray-500">Việt Nam</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700">
              {t('product.packaging')}
            </span>
            <span className="text-gray-500">Kiểu đóng gói</span>
          </div>
        </div>
      </div>

      {/* <div className="mt-24">
        <TopReviews></TopReviews>
      </div> */}
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
        {/* Image gallery */}
        <div className="w-full max-w-2xl mx-auto sm:block lg:max-w-none">
          <span className="rounded-md overflow-hidden">
            <div className="w-full h-96 bg-slate-200 rounded-lg flex content-center justify-center">
              <PhotoIcon className="w-48 text-white"></PhotoIcon>
            </div>
          </span>
        </div>

        {/* Product info */}
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
