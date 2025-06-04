import {
  HashtagIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import { Form, Outlet, useLoaderData, useMatches } from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { TabProps } from '~/components/tabs/Tab';
import { TabsContainer } from '~/components/tabs/TabsContainer';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { useTranslation } from 'react-i18next';
import { AccountInfoPanel } from '~/components/customer/CustomerInfo';
import { updateCustomer } from '~/providers/account/account';

export async function loader({ request }: DataFunctionArgs) {
  const { activeCustomer } = await getActiveCustomerDetails({ request });
  if (!activeCustomer) {
    return redirect('/sign-in');
  }

  // Lấy subset trường cần dùng
  const customerForUI = {
    id: activeCustomer.id,
    firstName: activeCustomer.firstName,
    phoneNumber: activeCustomer.phoneNumber ?? '',
  };

  return json({ activeCustomer: customerForUI });
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();

  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const phoneNumber = formData.get('phone') as string;

  // Gọi hàm cập nhật thông tin
  try {
    await updateCustomer({ firstName, lastName, phoneNumber }, { request });
    return redirect('/account');
  } catch (error) {
    return json({ error: 'Cập nhật thông tin thất bại' }, { status: 400 });
  }
}

export default function AccountDashboard() {
  const { activeCustomer } = useLoaderData<typeof loader>();
  const { firstName } = activeCustomer!;
  const { t } = useTranslation();

  const tabs: TabProps[] = [
    {
      Icon: UserCircleIcon,
      text: t('account.details'),
      to: './',
    },
    {
      Icon: ShoppingBagIcon,
      text: t('account.purchaseHistory'),
      to: './history',
    },
    {
      Icon: MapPinIcon,
      text: t('account.addresses'),
      to: './addresses',
    },
    {
      Icon: HashtagIcon,
      text: t('account.password'),
      to: './password',
    },
  ];

  return (
    <div className="max-w-6xl xl:mx-auto px-4">
      <h2 className="text-3xl sm:text-5xl font-light text-gray-900 my-8">
        {t('account.myAccount')}
      </h2>
      <p className="text-gray-700 text-lg -mt-4">
        {t('account.welcomeBack')}, {firstName}
      </p>
      <Form method="post" action="/api/logout">
        <button type="submit" className="underline text-gray-600 hover:text-gray-800">
          {t('account.signOut')}
        </button>
      </Form>
      <TabsContainer tabs={tabs}>
        <AccountInfoPanel customer={activeCustomer as any} />
      </TabsContainer>
    </div>
  );
}
