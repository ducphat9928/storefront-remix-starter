import { XCircleIcon } from '@heroicons/react/24/solid';

export default function Alert({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-800">{message}</h3>
        </div>
      </div>
    </div>
  );
}
