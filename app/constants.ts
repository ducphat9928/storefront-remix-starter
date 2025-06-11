import { CSSProperties } from 'react';
import { CollectionDetailsFragment } from './generated/graphql';

export const APP_META_TITLE = 'Quà Lưu Niệm';
export const APP_META_DESCRIPTION = 'Quà Lưu Niệm';
export const DEMO_API_URL = 'https://readonlydemo.vendure.io/shop-api';
export let API_URL =
  typeof process !== 'undefined' ? process.env.VENDURE_API_URL ?? DEMO_API_URL : DEMO_API_URL;

/**
 * This function is used when running in Cloudflare Pages in order to set the API URL
 * based on an environment variable. Env vars work differently in CF Pages and are not available
 * on the `process` object (which does not exist). Instead, it needs to be accessed from the loader
 * context, and if defined we use it here to set the API_URL var which will be used by the
 * GraphQL calls.
 *
 * See https://developers.cloudflare.com/workers/platform/environment-variables/#environmental-variables-with-module-workers
 */
export function setApiUrl(apiUrl: string) {
  API_URL = apiUrl;
}
export const PriceFilter = [
  {
    value: 'ASC',
    label: 'general.prices_gradually_increase',
  },
  {
    value: 'DESC',
    label: 'general.prices_gradually_decrease',
  },
];

export const StockFilter = [
  {
    value: 'instock',
    label: 'general.stocking',
  },
  {
    value: 'outstock',
    label: 'general.out_of_stock',
  },
];

export const SortList = [
  {
    value: 'default',
    label: 'general.default',
  },
  {
    value: 'new',
    label: 'general.latest',
  },
  {
    value: 'best-discount',
    label: 'general.Biggest_discount',
  },
  {
    value: 'best-seller',
    label: 'general.selling',
  },
];

export const rangePrice = [
  {
    priceMin: 0,
    priceMax: 100,
  },
  {
    priceMin: 100,
    priceMax: 500,
  },
  {
    priceMin: 500,
    priceMax: 1000,
  },
  {
    priceMin: 1000,
    priceMax: 2000,
  },
  {
    priceMin: 2000,
    priceMax: 5000,
  },
];
export enum CollectionSlug {
  HotDeals = 'hot-deals',
  TopSlider = 'top-slider',
  BestSeller = 'best-seller',
  NewProducts = 'new-products',
  BannerHomePage = 'banner-home-page',
  Loved = 'loved',
  ForYou = 'for-you',
  Outstanding = 'outstanding',
  Offer = 'offer',
  homePage = 'home-page',
  categories = 'categories',
}

export enum FacetSlug {
  MagazineType = 'magazine-type',
  Brand = 'brand',
}

export enum CacheKey {
  HomeData = 'home-data',
  ProductDetail = 'product-detail',
  BlogsData = 'blog-data',
  CombinedData = 'offers-data',
  Brand = 'brand',
}

export enum LocalStorageKey {
  Profile = 'profile',
  AuthToken = 'auth-token',
  IsLoign = 'login',
  ViewedProducts = 'viewedProducts',
  CurrencyCode = 'currency-code',
  Locale = 'locale',
  Categories = 'categories',
  FirstTimeAccess = 'first-time-access',
  Cache = 'REACT_QUERY_OFFLINE_CACHE',
}

type OrderStatusMappingData = Record<
  string,
  {
    label: string;
    style: {
      color: CSSProperties['color'];
      backgroundColor: CSSProperties['backgroundColor'];
    };
  }
>;

export const orderStatusMapingData: OrderStatusMappingData = {
  PaymentAuthorized: {
    label: 'statusOrder.unconfimred',
    style: {
      color: '#005EFB',
      backgroundColor: '#005EFB33',
    },
  },
  PaymentSettled: {
    label: 'statusOrder.confirmed',
    style: {
      color: '#0F766E',
      backgroundColor: '#96EBA1',
    },
  },
  Delivered: {
    label: 'statusOrder.has_received_the_goods',
    style: {
      color: '#B86F31',
      backgroundColor: '#EBC3A1',
    },
  },
  PartiallyDelivered: {
    label: 'statusOrder.awaiting_delivery',
    style: {
      color: '#B86F31',
      backgroundColor: '#EBC3A1',
    },
  },
  Shipped: {
    label: 'statusOrder.are_delivering',
    style: {
      color: '#817210',
      backgroundColor: '#d1c579',
    },
  },
  Cancelled: {
    label: 'statusOrder.cancelled',
    style: {
      color: '#FF0606',
      backgroundColor: '#FF060633',
    },
  },
  RequestReturn: {
    label: 'Yêu cầu hoàn trả',
    style: {
      color: '#c44003',
      backgroundColor: '#fc9a6d',
    },
  },
  Returned: {
    label: 'statusOrder.have_returned_the_goods',
    style: {
      color: '#2f2b2b',
      backgroundColor: '#d4caca',
    },
  },
  ArrangingPayment: {
    label: 'statusOrder.unconfimred',
    style: {
      color: '#521a6c',
      backgroundColor: '#d39bed',
    },
  },
};

export enum OrderState {
  AddingItems = 'AddingItems',
  PaymentAuthorized = 'PaymentAuthorized',
  PaymentSettled = 'PaymentSettled',
  Delivered = 'Delivered',
  Shipped = 'Shipped',
  PartiallyDelivered = 'PartiallyDelivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned',
  ArrangingPayment = 'ArrangingPayment',
}

export const listOrderNavigate = [
  {
    id: '1',
    title: 'general.all',
    key: [
      OrderState.PaymentAuthorized,
      OrderState.PaymentSettled,
      OrderState.Delivered,
      OrderState.Shipped,
      OrderState.PartiallyDelivered,
      OrderState.Cancelled,
      OrderState.Returned,
      OrderState.ArrangingPayment,
    ],
  },
  {
    id: '2',
    title: 'statusOrder.unconfimred',
    key: [OrderState.PaymentAuthorized],
  },
  {
    id: '3',
    title: 'statusOrder.confirmed',
    key: [OrderState.PaymentSettled],
  },
  {
    id: '5',
    title: 'statusOrder.awaiting_delivery',
    key: [OrderState.Shipped, OrderState.PartiallyDelivered],
  },
  {
    id: '4',
    title: 'statusOrder.has_received_the_goods',
    key: [OrderState.Delivered],
  },

  { id: '6', title: 'statusOrder.cancelled', key: [OrderState.Cancelled] },
  {
    id: '7',
    title: 'statusOrder.have_returned_the_goods',
    key: [OrderState.Returned],
  },
];

export interface Profile {
  name: string;
  customerId: string;
}

export enum TimeDuration {
  OneMinute = 60000,
  FifteenMinutes = 900000,
  ThirtyMinutes = 1800000,
  OneHour = 3600000,
  ThreeHour = 10800000,
  SixHour = 21600000,
  TwelveHours = 43200000,
  OneDay = 86400000,
}

export type Collection = CollectionDetailsFragment & {
  [key: string]: any;
};

export const getPaymentMethodDescription = (method: string): string => {
  switch (method) {
    case 'cod':
      return 'cart.payment-on-delivery';
    case 'braintree':
      return 'cart.payment-description-braintree';
    case 'stripe':
      return 'cart.payment-made-using-stripe';
    default:
      return 'cart.payment-on-delivery';
  }
};
