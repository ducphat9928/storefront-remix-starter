import { useLoaderData, Link } from '@remix-run/react';
import { getCollections } from '~/providers/collections/collections';
import { LoaderArgs } from '@remix-run/server-runtime';
import { useState, useEffect } from 'react';
import { ProductVariant } from '~/generated/graphql';
import 'keen-slider/keen-slider.min.css';
import { useKeenSlider } from 'keen-slider/react.js';
import PaginatedProductGrid from '~/components/products/PaginatedProductGrid';
import { FaFacebook } from 'react-icons/fa';

export async function loader({ request }: LoaderArgs) {
  const collections = await getCollections(request, { take: 20 });
  return {
    collections,
  };
}

export default function Index() {
  const { collections } = useLoaderData<typeof loader>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, slider] = useKeenSlider({
    loop: true,
    initial: 0,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (slider.current) {
        slider.current.next();
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [slider]);

  return (
    <>
      <div className="bg-white min-h-screen overflow-hidden pb-20 pl-20 pr-20">
        <div className="relative w-full">
          <div ref={sliderRef} className="keen-slider w-full h-[500px] sm:h-[600px]">
            {collections.map((collection) => (
              <div key={collection.id} className="keen-slider__slide relative w-full h-full">
                <Link
                  to={`/collections/${collection.slug || collection.id}`}
                  className="block w-full h-full"
                >
                  <img
                    src={collection.featuredAsset?.preview + '?w=1600'}
                    alt={collection.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white text-2xl font-semibold drop-shadow-lg">
                    {collection.name}
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Dot indicators nằm chồng lên ảnh */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20 p-1">
            {collections.map((_, idx) => (
              <button
                key={idx}
                onClick={() => slider.current?.moveToIdx(idx)}
                className={`w-5 h-5 rounded-full transition-colors ${
                  currentSlide === idx ? 'bg-gray-100' : 'bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              ></button>
            ))}
          </div>
        </div>

        {/* Collections Section */}
        {collections.map((collection) => (
          <section key={collection.id} className="py-4">
            <div className="container mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-center mt-4 w-[30%] mx-auto">
                <div className="flex-grow border-t border-gray-300" style={{ width: '60px' }}></div>
                <h2 className="text-3xl font-bold text-gray-800 mx-4 text-center">
                  {collection.name}
                </h2>
                <div className="flex-grow border-t border-gray-300" style={{ width: '60px' }}></div>
              </div>

              <PaginatedProductGrid
                variants={collection.productVariants.items as unknown as ProductVariant[]}
              />

              <div className="mt-4 text-center">
                <Link
                  to={'/collections/' + collection.slug}
                  prefetch="intent"
                  className="inline-block border border-gray-600 text-gray-600 font-semibold rounded-lg px-6 py-2 hover:bg-gray-600 hover:text-white transition"
                >
                  Xem Thêm
                </Link>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div
        className="fixed flex flex-col space-y-4"
        style={{ bottom: '50px', right: 20, zIndex: 10 }}
      >
        <a
          href="https://www.facebook.com/sharer/sharer.php?u=https://your-site.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="text-blue-600 hover:text-blue-800"
        >
          <FaFacebook size={50} />
        </a>

        <a
          href="https://zalo.me/your_zalo_id_or_url"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Zalo"
          className="text-[#0068FF] hover:text-[#004bbd]"
        >
          <img width={50} src="https://www.inlogo.vn/images/zalo-icon.png" alt="" />
        </a>
      </div>
    </>
  );
}
