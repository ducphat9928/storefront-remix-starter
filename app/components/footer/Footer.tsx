import { RootLoaderData } from '~/root';
import { Link } from '@remix-run/react';
import { useTranslation } from 'react-i18next';

const navigation = {
  support: [
    { page: 'help', href: '#' },
    { page: 'trackOrder', href: '#' },
    { page: 'shipping', href: '#' },
    { page: 'returns', href: '#' },
  ],
  company: [
    { page: 'about', href: '#' },
    { page: 'blog', href: '#' },
    { page: 'responsibility', href: '#' },
    { page: 'press', href: '#' },
  ],
};

export default function Footer({
  collections,
}: {
  collections: RootLoaderData['collections'];
}) {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-gray-50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {t('footer.title')}
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 ">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="grid grid-cols-2 gap-8 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                  Danh mục
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {collections.map((collection) => (
                    <li key={collection.id}>
                      <Link
                        className="text-base text-gray-500 hover:text-gray-600"
                        to={'/collections/' + collection.slug}
                        prefetch="intent"
                        key={collection.id}
                      >
                        {collection.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                  {t('footer.support')}
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.support.map(({ page, href }) => (
                    <li key={page}>
                      <a
                        href={href}
                        className="text-base text-gray-500 hover:text-gray-600"
                      >
                        {t(`navigation.support.${page}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div> */}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
                  {t('account.company')}
                </h3>
                <ul role="list" className="mt-4 space-y-4">
                  {navigation.company.map(({ page, href }) => (
                    <li key={page}>
                      <a
                        href={href}
                        className="text-base text-gray-500 hover:text-gray-600"
                      >
                        {t(`navigation.company.${page}`)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* <div className="mt-8 xl:mt-0">
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              {t('footer.subscribeHeader')}
            </h3>
            <p className="mt-4 text-base text-gray-500">
              {t('footer.subscribeIntro')}
            </p>
            <form className="mt-4 sm:flex sm:max-w-md">
              <label htmlFor="email-address" className="sr-only">
                {t('acount.emailAddress')}
              </label>
              <input
                type="email"
                name="email-address"
                id="email-address"
                autoComplete="email"
                required
                className="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white focus:border-white focus:placeholder-gray-400"
                placeholder={t('footer.emailPlaceholder')}
              />
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full bg-primary-500 border border-transparent rounded-md py-2 px-4 flex items-center justify-center text-base font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-primary-500"
                >
                  {t('footer.subscribe')}
                </button>
              </div>
            </form>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
