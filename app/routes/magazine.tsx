import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: DataFunctionArgs) {
  const { activeCustomer } = await getActiveCustomerDetails({ request });

  // Giả sử activeCustomer có danh sách tạp chí
  const magazines = [
    {
      id: 1,
      title: 'Tech Innovations 2024',
      image: 'https://source.unsplash.com/400x300/?technology',
    },
    {
      id: 2,
      title: 'Health & Wellness',
      image: 'https://source.unsplash.com/400x300/?health',
    },
    {
      id: 3,
      title: 'Business Insights',
      image: 'https://source.unsplash.com/400x300/?business',
    },
  ];

  return json({ activeCustomer, magazines });
}

export default function Magazine() {
  const { magazines } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-6xl xl:mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tin tức</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
        {magazines.map((magazine) => (
          <div
            key={magazine.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <img
              src={magazine.image}
              alt={magazine.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{magazine.title}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
