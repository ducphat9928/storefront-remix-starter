import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import type { Customer } from '~/generated/graphql';

interface AccountInfoPanelProps {
  customer: Customer;
}

export function AccountInfoPanel({ customer }: AccountInfoPanelProps) {
  const { t } = useTranslation();
  const { firstName, lastName, phoneNumber } = customer;

  return (
    <div className="py-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('account.editInformation')}</h3>

      <Form method="post" className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="firstName">
            {t('account.firstName')}
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            defaultValue={firstName ?? ''}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="lastName">
            {t('account.lastName')}
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            defaultValue={lastName ?? ''}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1" htmlFor="phone">
            {t('account.phone')}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={phoneNumber ?? ''}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {t('account.update')}
        </button>
      </Form>
    </div>
  );
}
