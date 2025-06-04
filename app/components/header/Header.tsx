import { Link, useLoaderData } from '@remix-run/react';
import { ShoppingBagIcon, Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { SearchBar } from '~/components/header/SearchBar';
import { useRootLoader } from '~/utils/use-root-loader';
import { classNames } from '~/utils/class-names';
import { SvgTree } from '../@svg/SvgTree';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LoaderArgs } from '@remix-run/server-runtime';
import { getCollections } from '~/providers/collections/collections';
import logo from '../img/image.png';
export async function loader({ request }: LoaderArgs) {
  const collections = await getCollections(request, { take: 20, filter: {} });
  return {
    collections,
  };
}

export function Header({
  onCartIconClick,
  cartQuantity,
}: {
  onCartIconClick: () => void;
  cartQuantity: number;
}) {
  const data = useRootLoader();
  const isSignedIn = !!data.activeCustomer.activeCustomer?.id;
  const { t } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const { collections } = useLoaderData<typeof loader>();

  return (
    <>
      {/* ✅ Top Header thêm mới */}

      <header
        className={classNames(
          'bg-gray-500 shadow-xl transform w-full sticky top-0 z-40 transition-transform duration-300 translate-y-0'
        )}
        style={{ position: 'inherit' }}
      >
        <div className="max-w-[85%] mx-auto p-2 flex items-center space-x-4">
          <Link to="/">
            <img height={80} width={80} src={logo} alt="logo" />
          </Link>

          <div className="flex-1 md:pr-8 hidden md:block">
            <SearchBar />
          </div>
          <button
            className="relative w-9 h-9 bg-white bg-opacity-20 rounded text-white p-1 hover:bg-gray-400 transition-all duration-200"
            onClick={onCartIconClick}
          >
            <ShoppingBagIcon />
            {cartQuantity ? (
              <div className="absolute rounded-full -top-2 -right-2 bg-gray-600 min-w-6 min-h-6 flex items-center justify-center text-xs p-1">
                {cartQuantity}
              </div>
            ) : null}
          </button>
        </div>
      </header>
      <div className="bg-gray-100 text-sm text-gray-700 w-full py-2 px-4">
        <div className="max-w-[85%] mx-auto flex items-center justify-between">
          {/* Bên trái: Nút Danh mục */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(true)}
              className="flex items-center gap-x-1 px-3 py-1 rounded hover:bg-gray-200 transition"
              aria-label="Open menu"
            >
              <Bars3Icon className="w-5 h-5" />
              <span className="text-sm font-medium">Danh mục</span>
            </button>

            <span className="font-medium hidden sm:inline">📞 Hotline: 1900 1234</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-gray-600">
              Giới thiệu
            </Link>
            {/* <Link to="/contact" className="hover:text-gray-600">
              Liên hệ
            </Link> */}
            {isSignedIn ? (
              <Link to="/account" className="hover:text-gray-600">
                Tài khoản
              </Link>
            ) : (
              <Link to="/sign-in" className="hover:text-gray-600">
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          ></div>

          <div
            className={classNames(
              'fixed top-0 left-0 bg-white w-80 h-full p-4 overflow-y-auto shadow-lg z-50 transition-transform duration-300 ease-in-out transform',
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Danh mục sản phẩm</h2>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <ul className="space-y-1">
              {collections?.map((collection) => (
                <li key={collection?.id}>
                  <Link
                    to={`/collections/${collection?.slug || collection?.id}`}
                    className="text-sm text-gray-700 hover:text-gray-600"
                    onClick={() => setMenuOpen(false)}
                  >
                    {collection?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
