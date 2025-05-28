import { useLoaderData } from '@remix-run/react';
import { getCollections } from '~/providers/collections/collections';
import { CollectionCard } from '~/components/collections/CollectionCard';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import { LoaderArgs } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { ProductCard } from '~/components/products/ProductCard';
import { CurrencyCode } from '~/generated/graphql';

export async function loader({ request }: LoaderArgs) {
  const collections = await getCollections(request, { take: 20 });
  return {
    collections,
  };
}

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { collections } = useLoaderData<typeof loader>();
  console.log(collections);

  const { t } = useTranslation();

  const handleNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % collections.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? collections.length - 1 : prevIndex - 1,
    );
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white min-h-screen overflow-hidden pb-20 pl-40 pr-40 pt-[30px]">
      <div className="relative bg-gray-900 overflow-hidden h-[500px] sm:h-[600px]">
        <div
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className="flex-shrink-0 relative w-full h-full"
              style={{
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
            >
              <img
                className="w-full h-full"
                src={collection.featuredAsset?.preview + '?w=1600'}
                alt={`header-${index}`}
              />
              {/* Optional overlay for better text contrast */}
              <div className="absolute inset-0 bg-black bg-opacity-0"></div>
            </div>
          ))}
        </div>

        {/* Content (text, etc) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-6 text-white z-10">
          {/* ... Your centered text content here if any ... */}
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4 -translate-y-1/2 z-20">
          <button
            onClick={handlePrev}
            className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg transition"
            aria-label="Previous Slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={handleNext}
            className="bg-gray-800 bg-opacity-70 hover:bg-opacity-90 text-white p-3 rounded-full shadow-lg transition"
            aria-label="Next Slide"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {collections.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition ${
                index === currentImageIndex
                  ? 'bg-red-600'
                  : 'bg-white opacity-60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Collections Section */}
      {collections.map((collection) => (
        <section key={collection.id} className="py-16">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-center mt-4 w-[30%] mx-auto">
              <div
                className="flex-grow border-t border-gray-300"
                style={{ width: '60px' }}
              ></div>
              <h2 className="text-3xl font-bold text-gray-800 mx-4 text-center">
                {collection.name}
              </h2>
              <div
                className="flex-grow border-t border-gray-300"
                style={{ width: '60px' }}
              ></div>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {Array.from(
                new Map(
                  collection.productVariants.items.map((variant) => [
                    variant.product.slug,
                    variant,
                  ]),
                ).values(),
              ).map((variant) => (
                <ProductCard
                  productId={'2'} // ✅ Thêm dòng này
                  productAsset={
                    variant.product.featuredAsset
                      ? {
                          id: '3', // dùng id thật nếu có
                          preview: variant.product.featuredAsset.preview,
                        }
                      : undefined
                  }
                  productName={variant.product.name}
                  slug={variant.product.slug}
                  priceWithTax={{ value: variant.price }}
                  currencyCode={CurrencyCode.Vnd}
                />
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link
                to={'/collections/' + collection.slug}
                prefetch="intent"
                key={collection.id}
                className="inline-block border border-red-600 text-red-600 font-semibold rounded-lg px-6 py-2 hover:bg-red-600 hover:text-white transition"
              >
                Xem Thêm
              </Link>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
