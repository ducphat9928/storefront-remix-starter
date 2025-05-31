// app/routes/about.tsx
import { MetaFunction } from '@remix-run/node';
import { useTranslation } from 'react-i18next';

export const meta: MetaFunction = () => {
  return [
    { title: 'Giới thiệu - Quà Lưu Niệm' },
    {
      name: 'description',
      content:
        'Khám phá câu chuyện và sứ mệnh của Quà Lưu Niệm – nơi lưu giữ nét đẹp văn hóa Việt qua từng sản phẩm thủ công.',
    },
  ];
};

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-gray-800">
      <h1 className="text-3xl font-bold text-primary-600 mb-6">Giới thiệu về Quà Lưu Niệm</h1>

      <section className="space-y-6">
        <p>
          <strong>Quà Lưu Niệm</strong> chuyên cung cấp các sản phẩm lưu niệm thủ công và cá nhân
          hóa như{' '}
          <span className="font-medium">
            cốc sứ in hình, móc chìa khóa, sổ tay thủ công, tranh treo tường
          </span>{' '}
          và nhiều món quà mang đậm nét đẹp văn hóa Việt.
        </p>

        <p>
          Chúng tôi tin rằng món quà ý nghĩa không chỉ đến từ vẻ ngoài, mà còn chứa đựng thông điệp
          tinh tế và cảm xúc chân thành từ người trao đến người nhận. Vì vậy, từng sản phẩm đều được
          tạo ra với sự <strong>tỉ mỉ, sáng tạo và tâm huyết</strong>.
        </p>

        <p>
          Với mong muốn trở thành cầu nối giữa truyền thống và hiện đại, giữa cá nhân và cộng đồng,
          Quà Lưu Niệm không ngừng sáng tạo để mang đến những món quà gần gũi, độc đáo và đậm bản
          sắc Việt.
        </p>

        <h2 className="text-2xl font-semibold mt-8 text-primary-600">Thông tin liên hệ</h2>
        <ul className="space-y-2 mt-4 text-base">
          <li>
            📍 <strong>Địa chỉ:</strong> (Cập nhật sau)
          </li>
          <li>
            📞 <strong>Hotline/Zalo đặt hàng:</strong> 0903 582 210
          </li>
          <li>
            📧 <strong>Email:</strong> lienhe@qualuuniem.com
          </li>
          <li>
            ⏰ <strong>Thời gian làm việc:</strong> 8:00 – 20:00 (Chủ nhật nghỉ)
          </li>
        </ul>
      </section>
    </main>
  );
}
