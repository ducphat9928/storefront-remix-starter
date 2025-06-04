import { XCircleIcon } from '@heroicons/react/24/solid';

export function ErrorMessage({ heading, message }: { heading: string; message: string }) {
  return (
    <div className="rounded-md bg-gray-50 p-4 max-w-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-800">{heading}</h3>
          <p className="text-sm text-gray-700 mt-2">{message}</p>
        </div>
      </div>
    </div>
  );
}
