import { Outlet, useLoaderData } from '@remix-run/react';
import { ActionFunctionArgs, json } from '@remix-run/server-runtime';
import AddAddressCard from '~/components/account/AddAddressCard';
import EditAddressCard from '~/components/account/EditAddressCard';
import { Address, ErrorCode, ErrorResult } from '~/generated/graphql';
import { deleteCustomerAddress, updateCustomerAddress } from '~/providers/account/account';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { getFixedT } from '~/i18next.server';
import { LoaderFunctionArgs } from '@remix-run/router';
import AccountTabs from '~/components/TabProfile';

export async function loader({ request }: LoaderFunctionArgs) {
  const res = await getActiveCustomerAddresses({ request });
  const activeCustomerAddresses = res.activeCustomer;
  return json({ activeCustomerAddresses });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get('id') as string | null;
  const _action = formData.get('_action');
  const t = await getFixedT(request);

  if (!id || id.length === 0) {
    return json<ErrorResult>(
      {
        errorCode: ErrorCode.IdentifierChangeTokenInvalidError,
        message: t('address.idError'),
      },
      { status: 400 }
    );
  }

  if (_action === 'setDefaultShipping') {
    updateCustomerAddress({ id, defaultShippingAddress: true }, { request });
    return null;
  }

  if (_action === 'setDefaultBilling') {
    updateCustomerAddress({ id, defaultBillingAddress: true }, { request });
    return null;
  }

  if (_action === 'deleteAddress') {
    const { success } = await deleteCustomerAddress(id, { request });
    return json(null, { status: success ? 200 : 400 });
  }

  return json<ErrorResult>(
    {
      message: t('common.unknowError'),
      errorCode: ErrorCode.UnknownError,
    },
    { status: 400 }
  );
}

export default function AccountAddresses() {
  const { activeCustomerAddresses } = useLoaderData<typeof loader>();

  return (
    <>
      <Outlet />
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <AccountTabs>
          <div className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <AddAddressCard />

            {activeCustomerAddresses?.addresses!.length === 0 ? (
              <div className="col-span-full text-gray-500 text-center py-12 border rounded-lg">
                No addresses found.
              </div>
            ) : (
              activeCustomerAddresses?.addresses!.map((address) => (
                <EditAddressCard address={address as Address} key={address.id} />
              ))
            )}
          </div>
        </AccountTabs>
      </div>
    </>
  );
}
