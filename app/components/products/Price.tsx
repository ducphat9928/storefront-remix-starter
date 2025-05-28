import { CurrencyCode } from '~/generated/graphql';
import { ProductCardProps } from './ProductCard';

type PriceProps = {
  priceWithTax?: number | ProductCardProps['priceWithTax'];
  currencyCode?: ProductCardProps['currencyCode'];
  className?: string;
};

export function Price({ priceWithTax, currencyCode, className }: PriceProps) {
  if (priceWithTax == null || !currencyCode) return null;

  if (typeof priceWithTax === 'number') {
    return (
      <span className={className}>
        {formatPrice(priceWithTax, currencyCode)}
      </span>
    );
  }

  if ('value' in priceWithTax) {
    return (
      <span className={className}>
        {formatPrice(priceWithTax.value, currencyCode)}
      </span>
    );
  }

  if (priceWithTax.min === priceWithTax.max) {
    return (
      <span className={className}>
        {formatPrice(priceWithTax.min, currencyCode)}
      </span>
    );
  }

  return (
    <span className={className}>
      {formatPrice(priceWithTax.min, currencyCode)} -{' '}
      {formatPrice(priceWithTax.max, currencyCode)}
    </span>
  );
}

function formatPrice(value: number, currency: CurrencyCode): string {
  const wholeNumber = Math.floor(value / 100);
  const locale = currency === CurrencyCode.Vnd ? 'vi-VN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(wholeNumber);
}
