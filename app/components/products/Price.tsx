import { CurrencyCode } from '~/generated/graphql';
import { ProductCardProps } from './ProductCard';

export function Price({
  priceWithTax,
  currencyCode,
}: {
  priceWithTax?: number | ProductCardProps['priceWithTax'];
  currencyCode?: ProductCardProps['currencyCode'];
}) {
  if (priceWithTax == null || !currencyCode) {
    return <></>;
  }
  if (typeof priceWithTax === 'number') {
    return <>{formatPrice(priceWithTax, currencyCode)}</>;
  }
  if ('value' in priceWithTax) {
    return <>{formatPrice(priceWithTax.value, currencyCode)}</>;
  }
  if (priceWithTax.min === priceWithTax.max) {
    return <>{formatPrice(priceWithTax.min, currencyCode)}</>;
  }
  return (
    <>
      {formatPrice(priceWithTax.min, currencyCode)} -{' '}
      {formatPrice(priceWithTax.max, currencyCode)}
    </>
  );
}

export function formatPrice(value: number, currency: CurrencyCode) {
  const wholeNumberValue = Math.floor(value / 100);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(wholeNumberValue);
}
