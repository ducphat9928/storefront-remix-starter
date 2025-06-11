import { PencilIcon } from '@heroicons/react/24/outline';
import { useActionData, useNavigation } from '@remix-run/react';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { withZod } from '@remix-validated-form/with-zod';
import { useEffect, useRef, useState } from 'react';
import { ValidatedForm, validationError } from 'remix-validated-form';
import { z } from 'zod';
import { Button } from '~/components/Button';
import { ErrorMessage } from '~/components/ErrorMessage';
import { HighlightedButton } from '~/components/HighlightedButton';
import { Input } from '~/components/Input';
import { SuccessMessage } from '~/components/SuccessMessage';
import { updateCustomerPassword } from '~/providers/account/account';
import { isErrorResult, isValidationErrorResponseData } from '~/utils/validation-helper';
import { useTranslation } from 'react-i18next';
import AccountTabs from '~/components/TabProfile';

export const validator = withZod(
  z
    .object({
      currentPassword: z.string().min(1, { message: 'Nhập mật khẩu cũ' }),
      newPassword: z.string().min(1, { message: 'Nhập mật khẩu mới' }),
      confirmPassword: z.string().min(1, { message: 'Nhập lại mật khẩu mới' }),
    })
    .refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
      path: ['confirmPassword'],
      message: 'Passwords must match',
    })
);

export async function action({ request }: DataFunctionArgs) {
  const body = await request.formData();

  const result = await validator.validate(body);
  if (result.error) {
    return validationError(result.error);
  }

  const { currentPassword, newPassword } = result.data;

  const res = await updateCustomerPassword({ currentPassword, newPassword }, { request });

  if (res.__typename !== 'Success') {
    return json(res, { status: 401 });
  }

  return json(res);
}

export default function AccountPassword() {
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const actionDataHook = useActionData<typeof action>();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (isValidationErrorResponseData(actionDataHook)) return;

    if (isErrorResult(actionDataHook)) {
      setErrorMessage(actionDataHook.message);
      setIsSaved(false);
      return;
    }

    if (actionDataHook?.success) {
      setErrorMessage(undefined);
      setIsSaved(true);
      formRef.current?.reset();
    }
  }, [actionDataHook]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6">
      <ValidatedForm
        validator={validator}
        method="post"
        formRef={formRef}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="rounded-xl space-y-6">
          <AccountTabs>
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label={t('account.currentPassword')}
                  name="currentPassword"
                  type="password"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  required
                  label={t('account.newPassword')}
                  name="newPassword"
                  type="password"
                />
                <Input
                  required
                  label={t('account.confirmPassword')}
                  name="confirmPassword"
                  type="password"
                />
              </div>
            </>
          </AccountTabs>

          {isSaved && (
            <SuccessMessage
              heading={t('account.pwdSuccessHeading')}
              message={t('account.pwdSuccessMessage')}
            />
          )}

          {errorMessage && (
            <ErrorMessage heading={t('account.pwdErrorMessage')} message={errorMessage} />
          )}

          <div className="flex justify-end pt-2 pb-2">
            <HighlightedButton type="submit">{t('account.savePassword')}</HighlightedButton>
          </div>
        </div>
      </ValidatedForm>
    </div>
  );
}
