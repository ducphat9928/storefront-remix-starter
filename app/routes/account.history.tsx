import { useLoaderData, useNavigation, useSubmit, NavLink } from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import OrderHistoryItem from '~/components/account/OrderHistoryItem';
import { getActiveCustomerOrderList } from '~/providers/customer/customer';
import { OrderListOptions, SortOrder } from '~/generated/graphql';
import { Pagination } from '~/components/Pagination';
import { ValidatedForm } from 'remix-validated-form';
import { withZod } from '@remix-validated-form/with-zod';
import {
  translatePaginationFrom,
  translatePaginationTo,
  paginationValidationSchema,
} from '~/utils/pagination';
import { useTranslation } from 'react-i18next';
import {
  HashtagIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import AccountTabs from '~/components/TabProfile';

const paginationLimitMinimumDefault = 10;
const allowedPaginationLimits = new Set<number>([paginationLimitMinimumDefault, 20, 30]);
const orderPaginationSchema = paginationValidationSchema(allowedPaginationLimits);

export async function loader({ request }: DataFunctionArgs) {
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') ?? paginationLimitMinimumDefault;
  const page = url.searchParams.get('page') ?? 1;

  const zodResult = orderPaginationSchema.safeParse({ limit, page });
  if (!zodResult.success) {
    url.search = '';
    return redirect(url.href);
  }

  const orderListOptions: OrderListOptions = {
    take: zodResult.data.limit,
    skip: (zodResult.data.page - 1) * zodResult.data.limit,
    sort: { createdAt: SortOrder.Desc },
    filter: { active: { eq: false } },
  };

  const res = await getActiveCustomerOrderList(orderListOptions, { request });
  if (!res.activeCustomer) {
    return redirect('/sign-in');
  }
  return json({
    orderList: res.activeCustomer.orders,
    appliedPaginationLimit: zodResult.data.limit,
    appliedPaginationPage: zodResult.data.page,
  });
}

function Tab({ to, Icon, text }: { to: string; Icon: React.FC<any>; text: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
         ${
           isActive
             ? 'border-green-600 text-green-700 font-semibold'
             : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-400'
         }`
      }
      end
    >
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </NavLink>
  );
}

export default function AccountHistory() {
  const { t } = useTranslation();
  const { orderList, appliedPaginationLimit, appliedPaginationPage } =
    useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();

  const showingOrdersFrom = translatePaginationFrom(appliedPaginationPage, appliedPaginationLimit);
  const showingOrdersTo = translatePaginationTo(
    appliedPaginationPage,
    appliedPaginationLimit,
    orderList.items.length
  );

  return (
    <div className="max-w-6xl xl:mx-auto px-4">
      {/* Tabs */}
      <AccountTabs>
        <div className="relative min-h-[300px]">
          {/* Loading overlay */}
          {navigation.state !== 'idle' && (
            <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
              <span className="text-green-600 font-semibold animate-pulse">{t('loading')}...</span>
            </div>
          )}

          {/* Purchase history content */}
          {orderList.items.length === 0 ? (
            <div className="py-16 text-center text-gray-400 italic select-none">
              {orderList.totalItems === 0 ? t('order.historyEmpty') : t('order.historyEnd')}
            </div>
          ) : (
            <>
              {orderList.items.map((item) => (
                <OrderHistoryItem
                  key={item.code}
                  // @ts-ignore
                  order={item}
                  isInitiallyExpanded={true}
                  className="mb-8"
                />
              ))}

              <div className="flex justify-between items-center mt-6 text-gray-600 text-sm">
                <div>
                  {t('order.showingOrders', {
                    from: showingOrdersFrom,
                    to: showingOrdersTo,
                    total: orderList.totalItems,
                  })}
                </div>
                <ValidatedForm
                  validator={withZod(paginationValidationSchema(allowedPaginationLimits))}
                  method="get"
                  onChange={(e) => submit(e.currentTarget, { preventScrollReset: true })}
                  preventScrollReset
                >
                  <Pagination
                    appliedPaginationLimit={appliedPaginationLimit}
                    allowedPaginationLimits={allowedPaginationLimits}
                    totalItems={orderList.totalItems}
                    appliedPaginationPage={appliedPaginationPage}
                  />
                </ValidatedForm>
              </div>
            </>
          )}
        </div>
      </AccountTabs>

      {/* Content area */}
    </div>
  );
}
