import { Link, useLoaderData } from '@remix-run/react';
import {
  ShoppingBagIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SearchBar } from '~/components/header/SearchBar';
import { useRootLoader } from '~/utils/use-root-loader';
import { useScrollingUp } from '~/utils/use-scrolling-up';
import { classNames } from '~/utils/class-names';
import { SvgTree } from '../@svg/SvgTree';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { LoaderArgs } from '@remix-run/server-runtime';
import { getCollections } from '~/providers/collections/collections';
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
  const isScrollingUp = useScrollingUp();
  const { t } = useTranslation();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { collections } = useLoaderData<typeof loader>();

  console.log(collections);

  return (
    <>
      <header
        className={classNames(
          'bg-green-500 shadow-xl transform w-full sticky top-0 z-50',
          isScrollingUp ? 'translate-y-0' : '-translate-y-full',
          'transition-transform duration-300',
        )}
      >
        <div className="max-w-[90%] mx-auto p-2 flex items-center space-x-4">
          <Link to="/">
            <div className="flex items-center justify-between h-16 bg-green-600 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <SvgTree />
              </div>
              <div className="flex flex-col items-start ml-4">
                <div className="text-2xl font-bold text-white font-sans">
                  Krông Pa Nature
                </div>
                <div className="text-sm text-white font-sans mt-1">
                  Dược liệu - Đặc sản Krông Pa
                </div>
              </div>
            </div>
          </Link>
          <button
            className="w-9 h-9 bg-white bg-opacity-20 rounded text-white p-1 hover:bg-green-400 transition-all duration-200"
            onClick={() => setMenuOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <div className="flex-1 md:pr-8">
            <SearchBar />
          </div>

          <button
            className="relative w-9 h-9 bg-white bg-opacity-20 rounded text-white p-1 hover:bg-green-400 transition-all duration-200"
            onClick={onCartIconClick}
          >
            <ShoppingBagIcon />
            {cartQuantity ? (
              <div className="absolute rounded-full -top-2 -right-2 bg-primary-600 min-w-6 min-h-6 flex items-center justify-center text-xs p-1">
                {cartQuantity}
              </div>
            ) : null}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50">
          <div className="bg-white w-80 h-full p-4 overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Danh mục sản phẩm</h2>
              <button onClick={() => setMenuOpen(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div>
              <ul className="space-y-1">
                {collections?.map((collection) => (
                  <li key={collection?.id}>
                    <Link
                      to={`/category/${collection?.slug || collection?.id}`}
                      className="text-sm text-gray-700 hover:text-green-600"
                      onClick={() => setMenuOpen(false)} // Đóng menu khi chọn
                    >
                      {collection?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
