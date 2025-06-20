import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
  useSubmit,
} from '@remix-run/react';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { useRef, useEffect } from 'react';
import { validationError } from 'remix-validated-form';
import { Button } from '~/components/Button';
import Modal from '~/components/modal/Modal';
import { HighlightedButton } from '~/components/HighlightedButton';
import useToggleState from '~/utils/use-toggle-state';
import CustomerAddressForm, { validator } from '~/components/account/CustomerAddressForm';
import { createCustomerAddress } from '~/providers/account/account';
import { getAvailableCountries } from '~/providers/checkout/checkout';
import { useTranslation } from 'react-i18next';

export async function loader({ request, params }: DataFunctionArgs) {
  const { availableCountries } = await getAvailableCountries({ request });

  return json({ availableCountries });
}

export async function action({ request, params }: DataFunctionArgs) {
  const formData = await request.formData();

  const result = await validator.validate(formData);
  if (result.error) {
    return validationError(result.error);
  }

  const data = result.data;

  await createCustomerAddress(
    {
      city: data.city,
      company: '',
      countryCode: 'vi',
      fullName: data.fullName,
      phoneNumber: data.phone,
      postalCode: '',
      province: data.province,
      streetLine1: data.streetLine1,
      streetLine2: data.streetLine2,
    },
    { request }
  );

  return json({ saved: true });
}

export default function NewAddress() {
  const { availableCountries } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const { state: isOpen, close } = useToggleState(true);
  const { t } = useTranslation();

  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  useEffect(() => {
    if (actionData?.saved) {
      close();
    }
  }, [actionData, close]);

  const submitForm = () => {
    if (formRef.current) {
      submit(formRef.current, { method: 'post' });
    }
  };

  const afterClose = () => {
    navigate(-1);
  };

  return (
    <div>
      <Modal isOpen={isOpen} close={close} afterClose={afterClose}>
        <Modal.Title>{t('address.new')}</Modal.Title>
        <Modal.Body>
          <CustomerAddressForm
            availableCountries={availableCountries}
            formRef={formRef}
            submit={submitForm}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" onClick={close}>
            {t('common.cancel')}
          </Button>
          <HighlightedButton
            isSubmitting={navigation.state === 'submitting'}
            type="button" // type=button để tránh submit mặc định
            onClick={submitForm}
          >
            {t('common.save')}
          </HighlightedButton>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
