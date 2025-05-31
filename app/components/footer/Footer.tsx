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
export default function Footer({ collections }: { collections: RootLoaderData['collections'] }) {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-gray-50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {t('footer.title')}
      </h2>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        {/* Lưới 3 cột thay vì 4 */}
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Cột 1: Danh mục collections */}
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
                  >
                    {collection.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 2: Giới thiệu & Thông tin liên hệ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Giới thiệu
            </h3>
            <ul role="list" className="mt-4 space-y-2 text-base text-gray-600">
              <li>
                <Link to="/about" className="hover:text-gray-800 font-medium text-gray-600">
                  Giới thiệu
                </Link>
              </li>
              <li>
                📧 Email:{' '}
                <a href="mailto:qualuuniem@gmail.com" className="hover:text-gray-800 font-medium">
                  qualuuniem@gmail.com
                </a>
              </li>
              <li>🕒 Thời gian làm việc: 8:00 – 20:00 (Chủ nhật nghỉ)</li>
            </ul>
          </div>

          {/* Cột 3: Hotline & Zalo */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">
              Đặt hàng nhanh
            </h3>
            <ul className="mt-4 space-y-2 text-base text-gray-600">
              <li>
                📞 Hotline:{' '}
                <a href="tel:0903582210" className="hover:text-gray-800 font-medium">
                  0903 582 210
                </a>
              </li>
              <li>
                💬 Zalo:{' '}
                <a
                  href="https://zalo.me/0903582210"
                  className="hover:text-gray-800 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  0903 582 210
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
        © 2025–{' '}
        <a
          href="https://qualuuniem.com"
          className="underline hover:text-gray-600"
          target="_blank"
          rel="noopener noreferrer"
        >
          qualuuniem.com
        </a>
        . All Rights Reserved.
      </div>
    </footer>
  );
}
