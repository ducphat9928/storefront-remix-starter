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
  selectedShippingAddressId?: string;
  onSelectShippingAddress?: (id: string) => void;
};

export default function EditAddressCard({
  address,
  selectedShippingAddressId,
  onSelectShippingAddress,
}: EditAddressProps) {
  const setShippingFetcher = useFetcher();
  const setDefaultFetcher = useFetcher();
  const deleteAddressFetcher = useFetcher<ErrorResult>();
  const revalidator = useRevalidator();
  const { t } = useTranslation();

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isSelectedLocal, setIsSelectedLocal] = useState(false);

  useEffect(() => {
    setIsSelectedLocal(selectedShippingAddressId === address.id);
  }, [selectedShippingAddressId, address.id]);

  useEffect(() => {
    if (setShippingFetcher.data) {
      revalidator.revalidate();
    }
  }, [setShippingFetcher.data]);

  return (
    <>
      {/* Modal Xóa */}
      <Modal
        isOpen={isDeleteModalVisible}
        close={() => setDeleteModalVisible(deleteAddressFetcher.state !== 'idle')}
      >
        <deleteAddressFetcher.Form method="post" preventScrollReset>
          <Modal.Title>{t('address.deleteModal.title')}</Modal.Title>
          <Modal.Body>
            <div className="space-y-4 my-4">
              {t('address.deleteModal.confirmation')}
              <input type="hidden" name="id" value={address.id} />
              {deleteAddressFetcher.data && (
                <ErrorMessage
                  heading={t('address.deleteModal.error')}
                  message={deleteAddressFetcher.data?.message ?? t('common.defaultError')}
                />
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              onClick={() => setDeleteModalVisible(false)}
              disabled={deleteAddressFetcher.state !== 'idle'}
            >
              {t('common.cancel')}
            </Button>
            <HighlightedButton
              type="submit"
              name="_action"
              value="deleteAddress"
              disabled={deleteAddressFetcher.state !== 'idle'}
              isSubmitting={deleteAddressFetcher.state !== 'idle'}
            >
              {t('common.yes')}
            </HighlightedButton>
          </Modal.Footer>
        </deleteAddressFetcher.Form>
      </Modal>

      {/* Card địa chỉ */}
      <div
        className={clsx(
          'group relative border p-5 min-h-[220px] flex flex-col justify-between transition duration-300 hover:shadow-md',
          {
            'border-blue-600': isSelectedLocal,
            'border-gray-400': address.defaultShippingAddress && !isSelectedLocal,
            'border-gray-200': !isSelectedLocal && !address.defaultShippingAddress,
          }
        )}
      >
        {/* Radio chọn giao hàng */}
        <setShippingFetcher.Form method="post" action="/api/active-order">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <input
              type="radio"
              name="selectedAddress"
              value={address.id}
              checked={isSelectedLocal}
              onChange={(e) => {
                onSelectShippingAddress?.(address.id);
                setIsSelectedLocal(true);
                setShippingFetcher.submit(e.currentTarget.form);
              }}
              className="accent-blue-600"
            />
            <input type="hidden" name="action" value="setCheckoutShipping" />
            <input type="hidden" name="fullName" value={address.fullName ?? ''} />
            <input type="hidden" name="streetLine1" value={address.streetLine1 ?? ''} />
            <input type="hidden" name="streetLine2" value={address.streetLine2 ?? ''} />
            <input type="hidden" name="city" value={address.city ?? ''} />
            <input type="hidden" name="province" value={address.province ?? ''} />
            <input type="hidden" name="postalCode" value="700000" />
            <input type="hidden" name="countryCode" value="VN" />
            <input type="hidden" name="phoneNumber" value={address.phoneNumber ?? ''} />
            <input
              type="hidden"
              name="defaultShippingAddress"
              value={String(!!address.defaultShippingAddress)}
            />
            <input
              type="hidden"
              name="defaultBillingAddress"
              value={String(!!address.defaultBillingAddress)}
            />
          </div>
        </setShippingFetcher.Form>

        {/* Nội dung địa chỉ */}
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
          {address.defaultShippingAddress && (
            <div className="text-end text-gray-500 uppercase tracking-wider mt-2 text-xs">
              Mặc định
            </div>
          )}
        </div>

        {/* Action buttons */}
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
            className="text-gray-700 flex items-center gap-x-2 hover:text-red-600"
            disabled={deleteAddressFetcher.state !== 'idle'}
            onClick={() => setDeleteModalVisible(true)}
          >
            {deleteAddressFetcher.state === 'idle' ? (
              <TrashIcon className="w-4 h-4" />
            ) : (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            )}
            {t('common.remove')}
          </button>
        </div>

        {/* Nút set mặc định */}
        {!address.defaultShippingAddress && !isSelectedLocal && (
          <setDefaultFetcher.Form method="post" action="/account/addresses">
            <input type="hidden" name="id" value={address.id} />
            <button
              name="_action"
              value="setDefaultShipping"
              type="submit"
              className="text-gray-700 flex items-center gap-2 hover:text-green-600 absolute bottom-4 left-4"
              disabled={setDefaultFetcher.state !== 'idle'}
            >
              {setDefaultFetcher.state === 'idle' ? (
                <TruckIcon className="w-5 h-5" />
              ) : (
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
              )}
              {t('common.shipping')}
            </button>
          </setDefaultFetcher.Form>
        )}
      </div>
    </>
  );
}
