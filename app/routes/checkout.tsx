import { ChevronRightIcon } from '@heroicons/react/24/solid';
import {
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
  useLoaderData,
  Link,
  useFetcher,
} from '@remix-run/react';
import { LoaderFunctionArgs, json } from '@remix-run/server-runtime';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CartContents } from '~/components/cart/CartContents';
import { CartTotals } from '~/components/cart/CartTotals';
import EditAddressCard from '~/components/account/EditAddressCard';

import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { activeShippingMethods } from '~/providers/orders/order';

import { Address } from '~/generated/graphql';
import { OutletContext } from '~/types';
import { classNames } from '~/utils/class-names';

const steps = ['shipping', 'payment', 'confirmation'];

export async function loader({ request }: LoaderFunctionArgs) {
  const res = await getActiveCustomerAddresses({ request });
  const shipping = await activeShippingMethods({ request });

  return json({
    activeCustomerAddresses: res.activeCustomer,
    getAllActive: shipping.activeShippingMethods,
  });
}

export default function Checkout() {
  const { activeOrder, adjustOrderLine, removeItem } = useOutletContext<OutletContext>();
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>();
  const { activeCustomerAddresses, getAllActive } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const fetcher = useFetcher();
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<string | null>(null);

  const state = location.pathname.startsWith('/checkout/confirmation')
    ? 'confirmation'
    : location.pathname === '/checkout/payment'
    ? 'payment'
    : 'shipping';

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
  };
  const isConfirmationPage = state === 'confirmation';

  // Auto set default shipping method nếu chưa có
  useEffect(() => {
    if (!getAllActive?.length) return;

    const defaultMethod = getAllActive.find(Boolean);
    if (!defaultMethod) return;

    const currentShippingMethod = activeOrder?.shippingLines?.[0]?.shippingMethod;

    if (!currentShippingMethod) {
      const formData = new FormData();
      formData.append('action', 'setShippingMethod');
      formData.append('shippingMethodId', defaultMethod.id);

      fetcher.submit(formData, {
        method: 'post',
        action: '/api/active-order',
      });
      setSelectedShippingMethodId(defaultMethod.id);
    } else {
      setSelectedShippingMethodId(currentShippingMethod.id);
    }
  }, [getAllActive, activeOrder]);

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
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Địa chỉ nhận hàng</h2>
                {activeCustomerAddresses?.addresses?.length === 0 ? (
                  <div className="text-sm text-gray-500">Bạn chưa có địa chỉ giao hàng.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCustomerAddresses?.addresses?.map((address) => (
                      <EditAddressCard
                        key={address.id}
                        address={address as Address}
                        selectedShippingAddressId={selectedAddressId}
                        onSelectShippingAddress={handleSelectAddress}
                      />
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

              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Phương thức giao hàng</h2>
                <div className="text-sm text-gray-700">
                  Dự kiến: <strong>10-15 ngày kể từ ngày giao hàng</strong>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {getAllActive
                    .filter((method): method is NonNullable<typeof method> => method !== null)
                    .map((method) => (
                      <fetcher.Form
                        key={method.id}
                        method="post"
                        action="/api/active-order"
                        onSubmit={() => {
                          setSelectedShippingMethodId(method.id);
                        }}
                      >
                        <input type="hidden" name="action" value="setShippingMethod" />
                        <input type="hidden" name="shippingMethodId" value={method.id} />
                        <button
                          type="submit"
                          className={classNames(
                            'border rounded-lg p-3 text-center text-sm hover:border-blue-600',
                            selectedShippingMethodId === method.id
                              ? 'border-blue-600'
                              : 'border-gray-300'
                          )}
                        >
                          <div className="font-medium">{method.name}</div>
                          <div
                            className="text-xs text-gray-500"
                            dangerouslySetInnerHTML={{ __html: method.description || '' }}
                          />
                        </button>
                      </fetcher.Form>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {!isConfirmationPage && (
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('order.summary')}</h2>
                <CartTotals order={activeOrder} />
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
