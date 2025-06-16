import { ArrowPathIcon, PencilIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline';
import { Link, useFetcher, useRevalidator } from '@remix-run/react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Address, ErrorResult } from '~/generated/graphql';
import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { HighlightedButton } from '../HighlightedButton';
import Modal from '../modal/Modal';
import { useTranslation } from 'react-i18next';

type EditAddressProps = {
  address: Address;
  isActive?: boolean;
};

export default function EditAddressCard({ address, isActive = false }: EditAddressProps) {
  const setShipping = useFetcher();
  const revalidator = useRevalidator();
  const deleteAddress = useFetcher<ErrorResult>();
  const [isDeleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (setShipping.state === 'idle') {
      revalidator.revalidate();
    }
  }, [setShipping.state, setShipping.data]);
  return (
    <>
      <Modal
        isOpen={isDeleteModalVisible}
        close={() => setDeleteModalVisible(deleteAddress.state === 'idle' ? false : true)}
      >
        <deleteAddress.Form method="post" preventScrollReset>
          <Modal.Title>{t('address.deleteModal.title')}</Modal.Title>
          <Modal.Body>
            <div className="space-y-4 my-4">
              {t('address.deleteModal.confirmation')}
              <input type="hidden" name="id" value={address.id} />
              {deleteAddress.data && (
                <ErrorMessage
                  heading={t('address.deleteModal.error')}
                  message={deleteAddress.data?.message ?? t('common.defaultError')}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              onClick={() => setDeleteModalVisible(false)}
              disabled={deleteAddress.state !== 'idle'}
            >
              {t('common.cancel')}
            </Button>
            <HighlightedButton
              type="submit"
              name="_action"
              value="deleteAddress"
              disabled={deleteAddress.state !== 'idle'}
              isSubmitting={deleteAddress.state !== 'idle'}
            >
              {t('common.yes')}
            </HighlightedButton>
          </Modal.Footer>
        </deleteAddress.Form>
      </Modal>
      <div
        className={clsx(
          'group relative border p-5 min-h-[220px] h-full w-full flex flex-col justify-between gap-4 transition-colors duration-300 hover:shadow-md',
          {
            'border-gray-400': address.defaultShippingAddress,
            'border-blue-900': isActive,
            'border-gray-200': !isActive && !address.defaultShippingAddress,
          }
        )}
      >
        {/* Nút giao hàng luôn hiển thị góc trên trái */}
        {!address.defaultShippingAddress && (
          <div className="absolute top-4 left-4">
            <setShipping.Form method="post" action="/account/addresses">
              <input type="hidden" name="id" value={address.id} />
              <button
                name="_action"
                value="setDefaultShipping"
                type="submit"
                title="Set as default shipping address"
                className="text-gray-700 flex items-center gap-2 hover:text-green-600"
                disabled={setShipping.state !== 'idle'}
              >
                {setShipping.state === 'idle' ? (
                  <TruckIcon className="w-5 h-5" />
                ) : (
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                )}
                {t('common.shipping')}
              </button>
            </setShipping.Form>
          </div>
        )}

        {/* Nội dung address — đẩy xuống chút */}
        <div className="mt-8 flex flex-col">
          <span className="text-left text-base-semi">{address.fullName}</span>
          {address.company && (
            <span className="text-small-regular text-gray-700">{address.company}</span>
          )}
          <div className="flex flex-wrap items-center text-left text-base-regular mt-2 gap-x-1">
            {address.streetLine2 && <span>{address.streetLine2},</span>}
            <span>{address.streetLine1},</span>
            <span>{address.postalCode},</span>
            <span>{address.city},</span>
            {address.province && <span>{address.province},</span>}
            <span>Việt Nam</span>
          </div>

          {(address.defaultShippingAddress || address.defaultBillingAddress) && (
            <div className="text-end text-gray-500 uppercase tracking-wider mt-2">
              <span className="block text-xs">{address.defaultShippingAddress && 'Mặc định'}</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 right-0 flex flex-col gap-2 bg-gray-200 p-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition duration-300 shadow-md rounded">
          <Link
            role="button"
            preventScrollReset
            className="text-gray-700 flex items-center gap-x-2 hover:text-gray-900"
            to={`/account/addresses/${address.id}`}
          >
            <PencilIcon className="w-4 h-4" />
            {t('common.edit')}
          </Link>

          <button
            type="button"
            title="Delete this address"
            className="text-gray-700 flex items-center gap-x-2 hover:text-red-600"
            disabled={deleteAddress.state !== 'idle'}
            onClick={() => setDeleteModalVisible(true)}
          >
            {deleteAddress.state === 'idle' ? (
              <TrashIcon className="w-4 h-4" />
            ) : (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            )}
            {t('common.remove')}
          </button>
        </div>
      </div>
    </>
  );
}
