import { ArrowPathIcon } from '@heroicons/react/24/solid';
import { Select } from '~/components/Select';
import { Button } from '~/components/Button';
import { ComponentProps } from 'react';
import { useNavigation } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { SvgPrevious } from '~/components/@svg/SvgPrevious';
import { SvgNext } from '~/components/@svg/SvgNext';

export type PaginationProps = {
  appliedPaginationLimit: number;
  allowedPaginationLimits: Set<number>;
  totalItems: number;
  appliedPaginationPage: number;
};

export function Pagination({
  appliedPaginationLimit,
  allowedPaginationLimits,
  totalItems,
  appliedPaginationPage,
  ...props
}: PaginationProps & ComponentProps<'div'>) {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const isLoading = navigation.state !== 'idle';
  const totalPages = Math.ceil(totalItems / appliedPaginationLimit);

  return (
    <div {...props} className={clsx('w-full flex mt-10 mb-10 px-4', props.className)}>
      <div className="flex flex-col md:flex-row items-center justify-end gap-4 w-full md:w-auto">
        {/* Nút phân trang */}
        <div className="flex items-center">
          <Button
            name="page"
            type="submit"
            value={appliedPaginationPage - 1}
            disabled={appliedPaginationPage <= 1 || isLoading}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Trang trước"
          >
            <SvgPrevious />
          </Button>
          <div className="text-sm text-gray-700 min-w-[100px] text-center">
            Trang {appliedPaginationPage} / {totalPages}
          </div>
          <Button
            name="page"
            type="submit"
            value={appliedPaginationPage + 1}
            disabled={appliedPaginationPage * appliedPaginationLimit >= totalItems || isLoading}
            className="p-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Trang tiếp"
          >
            <SvgNext />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && <ArrowPathIcon className="animate-spin h-5 w-5 text-gray-500" />}
          <label htmlFor="limit" className="text-sm text-gray-700">
            Số sản phẩm/trang:
          </label>
          <Select
            id="limit"
            name="limit"
            required
            noPlaceholder
            defaultValue={appliedPaginationLimit}
            className="text-sm"
          >
            {Array.from(allowedPaginationLimits).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
