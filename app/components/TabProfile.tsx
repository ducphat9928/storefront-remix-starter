import { NavLink } from '@remix-run/react';
import {
  UserCircleIcon,
  ShoppingBagIcon,
  MapPinIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

function FixedTab({
  to,
  Icon,
  text,
}: {
  to: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  text: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
        ${
          isActive
            ? 'border-green-600 text-green-700 font-semibold'
            : 'border-transparent text-gray-600 hover:text-green-600 hover:border-green-400'
        }`
      }
      end
    >
      <Icon className="h-5 w-5" />
      <span>{text}</span>
    </NavLink>
  );
}

type AccountTabsProps = {
  children: React.ReactNode;
};

export default function AccountTabs({ children }: AccountTabsProps) {
  return (
    <div>
      <nav className="flex border-b border-gray-200 mb-6">
        <FixedTab to="/account" Icon={UserCircleIcon} text="Details" />
        <FixedTab to="/account/history" Icon={ShoppingBagIcon} text="Purchase History" />
        <FixedTab to="/account/addresses" Icon={MapPinIcon} text="Addresses" />
        <FixedTab to="/account/password" Icon={HashtagIcon} text="Password" />
      </nav>
      <div>{children}</div>
    </div>
  );
}
