import { Form } from '@remix-run/react';
import { useTranslation } from 'react-i18next';
import { SvgMagnifyingGlass } from '../@svg/SvgMagnifyingGlass';

export function SearchBar() {
  const { t } = useTranslation();

  let initialQuery = '';
  if (typeof window !== 'undefined') {
    initialQuery = new URL(window.location.href).searchParams.get('q') ?? '';
  }

  return (
    <Form method="get" action="/search" key={initialQuery} className="w-full">
      <div className="relative">
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder={'Tìm kiếm'}
          className="w-full pr-10 shadow-sm focus:ring-primary-500 focus:border-primary-500 block sm:text-sm border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary-600"
        >
          <SvgMagnifyingGlass />
        </button>
      </div>
    </Form>
  );
}
