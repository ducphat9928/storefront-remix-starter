import { useLoaderData } from '@remix-run/react';
import { getCollections } from '~/providers/collections/collections';
import { CollectionCard } from '~/components/collections/CollectionCard';
import { BookOpenIcon } from '@heroicons/react/24/solid';
import { LoaderArgs } from '@remix-run/server-runtime';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';

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
    <div className="bg-white min-h-screen overflow-hidden p-20">
      <div className="relative bg-gray-900">
        <div
          className="absolute inset-0 h-full w-full flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentImageIndex * 100}%)`,
          }}
        >
          {collections.map((collection, index) => (
            <div
              key={collection.id}
              className="h-full w-full flex-shrink-0 relative"
              style={{
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1s ease-in-out',
              }}
            >
              <img
                className="h-full w-full object-cover opacity-50"
                src={collection.featuredAsset?.preview + '?w=1600'}
                alt={`header-${index}`}
              />
            </div>
          ))}
        </div>

        <div className="relative flex flex-col items-center text-center text-white py-32 px-6 sm:py-48 lg:px-0">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-yellow-500 to-red-500 bg-clip-text text-transparent">
            {t('vendure.title')}
          </h1>
          <p className="mt-6 text-lg sm:text-xl max-w-3xl">
            {t('vendure.intro')}{' '}
            <a
              href="https://www.vendure.io"
              className="underline decoration-yellow-500 hover:decoration-yellow-300"
            >
              Vendure
            </a>{' '}
            &{' '}
            <a
              href="~/routes/__cart/index"
              className="underline decoration-red-500 hover:decoration-red-300"
            >
              Remix
            </a>
          </p>
          <p className="mt-4 text-gray-300 flex items-center gap-2">
            <BookOpenIcon className="w-5 h-5" />
            <span>{t('common.readMore')}</span>
            <a
              href="https://www.vendure.io/blog/2022/05/lightning-fast-headless-commerce-with-vendure-and-remix"
              className="text-yellow-500 hover:text-yellow-300"
            >
              {t('vendure.link')}
            </a>
          </p>

          <div className="absolute left-0 right-0 flex justify-between items-center px-6 py-4">
            <button
              onClick={handlePrev}
              className="text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              className="text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700"
            >
              Next
            </button>
          </div>
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

            {/* Product Grid */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {collection.productVariants.items.map((variant) => (
                <Link
                  className="flex flex-col"
                  prefetch="intent"
                  to={`/products/${variant.product.slug}`}
                >
                  <div className="rounded-lg bg-white shadow-[0px_1px_11px_0px_rgba(0,_0,_0,_0.08)] p-2">
                    <img
                      className="w-full h-40 object-cover rounded-md"
                      src={variant.product?.featuredAsset?.preview}
                      alt={variant.product.name}
                    />
                    <h3 className="mt-4 text-xl font-semibold text-red-600">
                      {variant.price} <span className="text-sm">₫</span>
                    </h3>
                    <span className="text-gray-400 mt-2 text-sm">
                      ({t('common.price')}: {variant.price} VND)
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="~/routes/__cart/index"
                className="inline-block text-sm font-semibold text-primary-600 hover:text-primary-500"
              >
                {t('common.browseCategories')}{' '}
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
