import { DataFunctionArgs } from '@remix-run/server-runtime';
import { getOrderByCode } from '~/providers/orders/order';
import { useLoaderData } from '@remix-run/react';
import { CartContents } from '~/components/cart/CartContents';
import { CartTotals } from '~/components/cart/CartTotals';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import { useRevalidator } from '@remix-run/react';
import { useEffect, useState } from 'react';
import { OrderDetailFragment } from '~/generated/graphql';
import { useTranslation } from 'react-i18next';

export async function loader({ params, request }: DataFunctionArgs) {
  try {
    const order = await getOrderByCode(params.orderCode!, { request });
    return {
      order,
      error: false,
    };
  } catch (ex) {
    return {
      order: null,
      error: true,
    };
  }
}

export default function CheckoutConfirmation() {
  const { order, error } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [retries, setRetries] = useState(1);
  const { t } = useTranslation();

  const orderNotFound = !order && !error;
  const orderErrored = !order && error;
  const maxRetries = 5;
  const retriesExhausted = retries >= maxRetries;
  const retryTimeout = 2500;

  const retry = () => {
    if (!window) return;
    setRetries(retries + 1);
    window.setTimeout(() => {
      if (retries > maxRetries) return;
      revalidator.revalidate();
    }, retryTimeout);
  };

  useEffect(() => {
    if (orderErrored) retry();
  }, [order]);

  useEffect(() => {
    if (revalidator.state === 'idle' && orderErrored && retries <= maxRetries && retries > 1) {
      retry();
    }
  }, [revalidator.state]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fadeIn">
      {orderNotFound && (
        <div className="text-center text-gray-700">
          <h2 className="text-3xl sm:text-5xl font-semibold mb-4">{t('checkout.orderNotFound')}</h2>
          <p className="text-lg">{t('checkout.orderNotFoundMessage')}</p>
        </div>
      )}

      {orderErrored && retriesExhausted && (
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-semibold flex items-center justify-center gap-3 text-red-600 mb-4">
            <XCircleIcon className="w-10 h-10" />
            {t('checkout.orderErrorTitle')}
          </h2>
          <p className="text-lg text-gray-700">{t('checkout.orderErrorMessage')}</p>
        </div>
      )}

      {orderErrored && !retriesExhausted && (
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-light text-gray-900 my-8">
            {t('checkout.orderProcessing')}
          </h2>
        </div>
      )}

      {order && (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-10 space-y-6">
          <div className="flex items-center space-x-4">
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900">
                {t('order.summary')}
              </h2>
              <p className="text-md text-gray-600">
                {t('checkout.orderSuccessMessage')} <span className="font-bold">{order.code}</span>
              </p>
            </div>
          </div>

          {order.active && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-1" />
                <p className="text-sm text-blue-700">{t('checkout.paymentMessage')}</p>
              </div>
            </div>
          )}

          <div className="border-t pt-6">
            <CartContents
              orderLines={order.lines}
              currencyCode={order.currencyCode}
              editable={false}
            />
          </div>

          <div className="border-t pt-6">
            <CartTotals order={order as OrderDetailFragment} />
          </div>
        </div>
      )}
    </div>
  );
}
