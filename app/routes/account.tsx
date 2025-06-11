import {
  HashtagIcon,
  MapPinIcon,
  ShoppingBagIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid';
import { Form, useLoaderData, useActionData } from '@remix-run/react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

import { TabsContainer } from '~/components/tabs/TabsContainer';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { setCustomerAvatar, updateCustomer } from '~/providers/account/account';
import type { TabProps } from '~/components/tabs/Tab';
import { IconUser } from '~/icons/IconMenu';
import { useMutation } from '@tanstack/react-query';
import { DocumentNode } from 'graphql';
import { uploadFile } from '~/graphqlWrapper';
import { SetCustomerAvatarDocument } from '~/generated/graphql';
import AccountTabs from '~/components/TabProfile';

type LoaderData = {
  activeCustomer: {
    id: string;
    firstName: string;
    phoneNumber: string;
    avatarId: string;
    dateOfBirth: string;
    gender: string;
  };
};

type ActionData = {
  success?: boolean;
  error?: string;
};

export async function loader({ request }: DataFunctionArgs) {
  const { activeCustomer } = await getActiveCustomerDetails({ request });

  if (!activeCustomer) {
    return redirect('/sign-in');
  }

  const customerForUI = {
    id: activeCustomer.id,
    firstName: activeCustomer.firstName,
    phoneNumber: activeCustomer.phoneNumber ?? '',
    avatarId: activeCustomer.customFields?.avatar?.preview ?? '',
    dateOfBirth: (activeCustomer.customFields?.dateOfBirth as string) ?? '',
    gender:
      activeCustomer.customFields?.gender !== undefined &&
      activeCustomer.customFields?.gender !== null
        ? String(activeCustomer.customFields.gender)
        : '',
  };

  return json<LoaderData>({ activeCustomer: customerForUI });
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();

  const firstName = formData.get('firstName') as string;
  const phoneNumber = formData.get('phone') as string;
  const rawDateOfBirth = formData.get('dateOfBirth') as string | null;
  const dateOfBirth = rawDateOfBirth ? new Date(rawDateOfBirth).toISOString() : undefined;
  const genderRaw = formData.get('gender');
  const gender = genderRaw !== null ? Number(genderRaw) : null;

  let avatarId = (formData.get('avatarId') as string) || '';

  const avatarFile = formData.get('avatar') as File;
  if (avatarFile && avatarFile.size > 0) {
    const uploaded = await setCustomerAvatar(avatarFile, { request });
    avatarId = uploaded?.preview || '';
  }

  try {
    await updateCustomer(
      {
        firstName,
        phoneNumber,
        customFields: {
          avatarId,
          dateOfBirth,
          gender,
        },
      },
      { request }
    );
    return json<ActionData>({ success: true });
  } catch (e) {
    console.error(e);
    return json<ActionData>({ error: 'Cập nhật thông tin thất bại' }, { status: 400 });
  }
}

export default function AccountDashboard() {
  const { activeCustomer } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const { t } = useTranslation();
  // const tabs: TabProps[] = [
  //   { Icon: UserCircleIcon, text: t('account.details'), to: './' },
  //   { Icon: ShoppingBagIcon, text: t('account.purchaseHistory'), to: './history' },
  //   { Icon: MapPinIcon, text: t('account.addresses'), to: './addresses' },
  //   { Icon: HashtagIcon, text: t('account.password'), to: './password' },
  // ];

  useEffect(() => {
    if (actionData?.success) toast.success(t('account.updateSuccess'));
    if (actionData?.error) toast.error(actionData.error);
  }, [actionData, t]);

  return (
    <div className="max-w-6xl xl:mx-auto px-4">
      <AccountTabs>
        <h2 className="text-3xl sm:text-5xl font-light text-gray-900 my-8">
          {t('account.myAccount')}
        </h2>

        <p className="text-gray-700 text-lg -mt-4 mb-6">
          {t('account.welcomeBack')}, {activeCustomer.firstName}
        </p>

        <Form method="post" action="/api/logout" className="mb-10">
          <button type="submit" className="underline text-gray-600 hover:text-gray-800">
            {t('account.signOut')}
          </button>
        </Form>

        <Form
          method="post"
          className="mx-auto max-w-md p-8 bg-white rounded-lg shadow space-y-6 my-5"
        >
          <InputField
            id="firstName"
            name="firstName"
            label={t('account.fullName')}
            required
            defaultValue={activeCustomer.firstName}
            aria-label={t('account.fullName')}
          />

          <InputField
            id="phone"
            name="phone"
            type="tel"
            label={t('account.phone')}
            required
            defaultValue={activeCustomer.phoneNumber}
            aria-label={t('account.phone')}
          />

          <InputField
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            label={t('account.dateOfBirth')}
            defaultValue={activeCustomer.dateOfBirth ? activeCustomer.dateOfBirth.slice(0, 10) : ''}
            aria-label={t('account.dateOfBirth')}
          />

          <div>
            <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">
              {t('account.gender')}
            </label>
            <select
              id="gender"
              name="gender"
              defaultValue={activeCustomer.gender}
              className="w-full rounded border border-gray-300 p-2 focus:border-gray-600 focus:ring focus:ring-gray-300 transition"
              aria-label={t('account.gender')}
            >
              <option value="">{t('common.select')}</option>
              <option value="0">{t('account.genderMale')}</option>
              <option value="1">{t('account.genderFemale')}</option>
              <option value="2">{t('account.genderOther')}</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-gray-600 px-4 py-2 text-white font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition disabled:opacity-50"
          >
            {t('common.update')}
          </button>
        </Form>
      </AccountTabs>
    </div>
  );
}

function InputField({
  id,
  name,
  type = 'text',
  label,
  defaultValue,
  placeholder,
  required = false,
  ariaLabel,
}: {
  id: string;
  name: string;
  type?: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  ariaLabel?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-label={ariaLabel || label}
        className="w-full rounded border border-gray-300 p-2"
      />
    </div>
  );
}
