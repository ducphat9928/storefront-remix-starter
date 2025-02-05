import { Link, useLoaderData } from '@remix-run/react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { SearchBar } from '~/components/header/SearchBar';
import { useRootLoader } from '~/utils/use-root-loader';
import { UserIcon } from '@heroicons/react/24/solid';
import { useScrollingUp } from '~/utils/use-scrolling-up';
import { classNames } from '~/utils/class-names';
import { useTranslation } from 'react-i18next';
import { SvgTree } from '../@svg/SvgTree';
import { SvgMagazine } from '../@svg/SvgMagazine';

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

  return (
    <header
      className={classNames(
        'bg-green-500 shadow-xl transform w-[100%] sticky ',
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
        <div className="flex-1 md:pr-8">
          <SearchBar></SearchBar>
        </div>
        <div className="flex items-center gap-2 text-white text-base font-medium px-3 py-2 rounded h-9 hover:bg-green-400 hover:text-white transition-all duration-200 cursor-pointer">
          <SvgMagazine />
          <span className="font-sans">Tin tức</span>
        </div>

        <div className="">
          <button
            className="relative w-9 h-9 bg-white bg-opacity-20 rounded text-white p-1 hover:bg-green-400 transition-all duration-200"
            onClick={onCartIconClick}
          >
            <ShoppingBagIcon />
            {cartQuantity ? (
              <div className="absolute rounded-full -top-2 -right-2 bg-primary-600 min-w-6 min-h-6 flex items-center justify-center text-xs p-1">
                {cartQuantity}
              </div>
            ) : (
              ''
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
