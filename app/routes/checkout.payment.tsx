import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import {
  addPaymentToOrder,
  createStripePaymentIntent,
  generateBraintreeClientToken,
  getEligiblePaymentMethods,
  getNextOrderStates,
  transitionOrderToState,
} from '~/providers/checkout/checkout';
import { useLoaderData, useOutletContext } from '@remix-run/react';
import { OutletContext } from '~/types';
import { CurrencyCode, ErrorCode, ErrorResult } from '~/generated/graphql';
import { StripePayments } from '~/components/checkout/stripe/StripePayments';
import { DummyPayments } from '~/components/checkout/DummyPayments';
import { BraintreeDropIn } from '~/components/checkout/braintree/BraintreePayments';
import { getActiveOrder } from '~/providers/orders/order';
import { getSessionStorage } from '~/sessions';
import { useTranslation } from 'react-i18next';

export async function loader({ params, request }: DataFunctionArgs) {
  const session = await getSessionStorage().then((sessionStorage) =>
    sessionStorage.getSession(request?.headers.get('Cookie'))
  );
  const activeOrder = await getActiveOrder({ request });

  //check if there is an active order if not redirect to homepage
  if (!session || !activeOrder || !activeOrder.active || activeOrder.lines.length === 0) {
    return redirect('/');
  }

  const { eligiblePaymentMethods } = await getEligiblePaymentMethods({
    request,
  });
  const error = session.get('activeOrderError');
  let stripePaymentIntent: string | undefined;
  let stripePublishableKey: string | undefined;
  let stripeError: string | undefined;
  if (eligiblePaymentMethods.find((method) => method.code.includes('stripe'))) {
    try {
      const stripePaymentIntentResult = await createStripePaymentIntent({
        request,
      });
      stripePaymentIntent = stripePaymentIntentResult.createStripePaymentIntent ?? undefined;
      stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    } catch (e: any) {
      stripeError = e.message;
    }
  }

  let brainTreeKey: string | undefined;
  let brainTreeError: string | undefined;
  if (eligiblePaymentMethods.find((method) => method.code.includes('braintree'))) {
    try {
      const generateBrainTreeTokenResult = await generateBraintreeClientToken({
        request,
      });
      brainTreeKey = generateBrainTreeTokenResult.generateBraintreeClientToken ?? '';
    } catch (e: any) {
      brainTreeError = e.message;
    }
  }
  return json({
    eligiblePaymentMethods,
    stripePaymentIntent,
    stripePublishableKey,
    stripeError,
    brainTreeKey,
    brainTreeError,
    error,
  });
}

export async function action({ params, request }: DataFunctionArgs) {
  const body = await request.formData();
  const paymentMethodCode = body.get('paymentMethodCode');
  const paymentNonce = body.get('paymentNonce');
  if (typeof paymentMethodCode === 'string') {
    const { nextOrderStates } = await getNextOrderStates({
      request,
    });
    if (nextOrderStates.includes('ArrangingPayment')) {
      const transitionResult = await transitionOrderToState('ArrangingPayment', { request });
      if (transitionResult.transitionOrderToState?.__typename !== 'Order') {
        throw new Response('Not Found', {
          status: 400,
          statusText: transitionResult.transitionOrderToState?.message,
        });
      }
    }

    const result = await addPaymentToOrder(
      { method: paymentMethodCode, metadata: { nonce: paymentNonce } },
      { request }
    );
    if (result.addPaymentToOrder.__typename === 'Order') {
      return redirect(`/checkout/confirmation/${result.addPaymentToOrder.code}`);
    } else {
      throw new Response('Not Found', {
        status: 400,
        statusText: result.addPaymentToOrder?.message,
      });
    }
  }
}

export default function CheckoutPayment() {
  const {
    eligiblePaymentMethods,
    stripePaymentIntent,
    stripePublishableKey,
    stripeError,
    brainTreeKey,
    brainTreeError,
    error,
  } = useLoaderData<typeof loader>();
  const { activeOrder } = useOutletContext<OutletContext>();
  const { t } = useTranslation();

  const paymentError = getPaymentError(error);

  return (
    <div className="w-full space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('checkout.choosePayment')}</h2>

      {eligiblePaymentMethods.map((paymentMethod) => {
        const key = paymentMethod.id;

        // === BrainTree Payment UI ===
        if (paymentMethod.code.includes('braintree')) {
          return (
            <div key={key} className="p-6 bg-white rounded-xl shadow border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4">{paymentMethod.name}</h3>
              {brainTreeError ? (
                <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                  <p className="text-gray-700 font-semibold">{t('checkout.braintreeError')}</p>
                  <p className="text-sm text-gray-600 mt-1">{brainTreeError}</p>
                </div>
              ) : (
                <BraintreeDropIn
                  fullAmount={activeOrder?.totalWithTax ?? 0}
                  currencyCode={activeOrder?.currencyCode ?? ('USD' as CurrencyCode)}
                  show={true}
                  authorization={brainTreeKey!}
                />
              )}
            </div>
          );
        }

        // === Stripe Payment UI ===
        if (paymentMethod.code.includes('stripe')) {
          return (
            <div key={key} className="p-6 bg-white rounded-xl shadow border border-gray-100">
              <h3 className="text-lg font-medium text-gray-700 mb-4">{paymentMethod.name}</h3>
              {stripeError ? (
                <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                  <p className="text-gray-700 font-semibold">{t('checkout.stripeError')}</p>
                  <p className="text-sm text-gray-600 mt-1">{stripeError}</p>
                </div>
              ) : (
                <StripePayments
                  orderCode={activeOrder?.code ?? ''}
                  clientSecret={stripePaymentIntent!}
                  publishableKey={stripePublishableKey!}
                />
              )}
            </div>
          );
        }

        // === Dummy / Other Payment UI ===
        return (
          <div key={key} className="p-6 bg-white rounded-xl shadow border border-gray-100">
            <h3 className="text-lg font-medium text-gray-700 mb-4">{paymentMethod.name}</h3>
            <DummyPayments paymentMethod={paymentMethod} paymentError={paymentError} />
          </div>
        );
      })}
    </div>
  );
}

function getPaymentError(error?: ErrorResult): string | undefined {
  if (!error || !error.errorCode) {
    return undefined;
  }
  switch (error.errorCode) {
    case ErrorCode.OrderPaymentStateError:
    case ErrorCode.IneligiblePaymentMethodError:
    case ErrorCode.PaymentFailedError:
    case ErrorCode.PaymentDeclinedError:
    case ErrorCode.OrderStateTransitionError:
    case ErrorCode.NoActiveOrderError:
      return error.message;
  }
}
