import { ChevronRightIcon } from '@heroicons/react/24/solid';
import { Outlet, useLocation, useOutletContext } from '@remix-run/react';
import { CartContents } from '~/components/cart/CartContents';
import { OutletContext } from '~/types';
import { classNames } from '~/utils/class-names';
import { CartTotals } from '~/components/cart/CartTotals';
import { useTranslation } from 'react-i18next';

const steps = ['shipping', 'payment', 'confirmation'];

export default function Checkout() {
  const outletContext = useOutletContext<OutletContext>();
  const { activeOrder, adjustOrderLine, removeItem } = outletContext;
  const location = useLocation();
  const { t } = useTranslation();

  let state = 'shipping';
  if (location.pathname === '/checkout/payment') {
    state = 'payment';
  } else if (location.pathname.startsWith('/checkout/confirmation')) {
    state = 'confirmation';
  }
  const isConfirmationPage = state === 'confirmation';

  return (
    <div className="bg-gray-50 min-h-screen">
      <div
        className={classNames(
          isConfirmationPage ? 'lg:max-w-3xl mx-auto' : 'lg:max-w-6xl',
          'max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24'
        )}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">{t('cart.checkout')}</h1>

        {/* Step Progress */}
        <nav aria-label={t('cart.progress')} className="mb-10">
          <ol className="flex items-center justify-center space-x-4 sm:space-x-8">
            {steps.map((step, idx) => (
              <li key={step} className="flex items-center text-sm sm:text-base">
                <span
                  className={classNames(
                    'font-medium',
                    step === state ? 'text-red-600' : 'text-gray-500'
                  )}
                >
                  {t(`checkout.steps.${step}`)}
                </span>
                {idx < steps.length - 1 && (
                  <ChevronRightIcon className="w-5 h-5 text-gray-300 ml-2" aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
          <div className={classNames(isConfirmationPage ? 'lg:col-span-12' : 'lg:col-span-7')}>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Outlet context={outletContext} />
            </div>
          </div>

          {/* Order Summary */}
          {!isConfirmationPage && (
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('order.summary')}</h2>

                <CartContents
                  orderLines={activeOrder?.lines ?? []}
                  currencyCode={activeOrder?.currencyCode!}
                  editable={state === 'shipping'}
                  removeItem={removeItem}
                  adjustOrderLine={adjustOrderLine}
                />
                <div className="mt-4">
                  <CartTotals order={activeOrder} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
