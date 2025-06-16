import { ChevronRightIcon } from '@heroicons/react/24/solid';
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useLoaderData,
  Link,
} from '@remix-run/react';
import { CartContents } from '~/components/cart/CartContents';
import { OutletContext } from '~/types';
import { classNames } from '~/utils/class-names';
import { CartTotals } from '~/components/cart/CartTotals';
import { useTranslation } from 'react-i18next';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { Address } from '~/generated/graphql';
import { useState } from 'react';
import EditAddressCard from '~/components/account/EditAddressCard';

const steps = ['shipping', 'payment', 'confirmation'];

export async function loader({ request }: LoaderFunctionArgs) {
  const res = await getActiveCustomerAddresses({ request });
  const activeCustomerAddresses = res.activeCustomer;
  return json({ activeCustomerAddresses });
}

export default function Checkout() {
  const outletContext = useOutletContext<OutletContext>();
  const { activeOrder, adjustOrderLine, removeItem } = outletContext;
  const { activeCustomerAddresses } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    activeCustomerAddresses?.addresses?.find((a) => a.defaultShippingAddress)?.id ?? null
  );

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
                    step === state ? 'text-gray-600' : 'text-gray-500'
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-8">
              {/* Địa chỉ nhận hàng */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Địa chỉ nhận hàng</h2>
                {activeCustomerAddresses?.addresses?.length === 0 ? (
                  <div className="text-sm text-gray-500">Bạn chưa có địa chỉ giao hàng.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCustomerAddresses?.addresses?.map((address) => (
                      <div key={address.id}>
                        <EditAddressCard address={address as Address} />
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  to="/account/addresses/new"
                  className="inline-flex items-center text-sm text-blue-600 hover:underline mt-2"
                >
                  + Thêm địa chỉ mới
                </Link>
              </div>

              {/* Giỏ hàng */}
              <CartContents
                orderLines={activeOrder?.lines ?? []}
                currencyCode={activeOrder?.currencyCode!}
                editable={state === 'shipping'}
                removeItem={removeItem}
                adjustOrderLine={adjustOrderLine}
              />

              {/* Phương thức thanh toán */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Phương thức thanh toán</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    'Ví MoMo',
                    'Chuyển khoản QR',
                    'Thẻ ATM/Internet Banking',
                    'Visa/Mastercard/JCB',
                    'Tiền mặt',
                  ].map((method) => (
                    <button
                      key={method}
                      className="border border-gray-300 rounded-lg p-3 text-center text-sm hover:border-blue-600"
                    >
                      {method}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Thanh toán bảo mật qua cổng OnePAY.</p>
              </div>

              {/* Phương thức giao hàng */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Phương thức giao hàng</h2>
                <div className="text-sm text-gray-700">
                  Dự kiến: <strong>13/06 - 16/06</strong> (Miễn phí)
                </div>
              </div>
            </div>
          </div>

          {!isConfirmationPage && (
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('order.summary')}</h2>

                <div className="mt-4">
                  <CartTotals order={activeOrder} />
                </div>
                {state === 'shipping' && (
                  <div className="mt-6 flex gap-5 justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                    >
                      {t('cart.continue_shopping', 'Mua thêm')}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/checkout/payment')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                    >
                      {t('cart.place_order', 'Đặt hàng')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
