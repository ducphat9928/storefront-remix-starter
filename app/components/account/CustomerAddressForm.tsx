import { useState, useEffect, RefObject } from 'react';
import provincesData from '../../vietnam-provinces.json';
import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { ValidatedForm } from 'remix-validated-form';
import { Input } from '~/components/Input';
import { Select } from '~/components/Select';
import { useTranslation } from 'react-i18next';
import { Address } from '~/generated/graphql';

export const validator = withZod(
  z.object({
    fullName: z.string().min(1, { message: 'Họ và tên là bắt buộc' }),
    city: z.string().min(1, { message: 'Quận/huyện là bắt buộc' }),
    province: z.string().min(1, { message: 'Tỉnh/thành phố là bắt buộc' }),
    streetLine1: z.string().min(1, { message: 'Phường/xã là bắt buộc' }),
    streetLine2: z.string(),
    phone: z.string(),
  })
);

interface Province {
  name: string;
  districts: District[];
}

interface District {
  name: string;
  wards?: { name: string }[];
}

export default function CustomerAddressForm({
  address,
  formRef,
  submit,
}: {
  address?: Address;
  formRef: RefObject<HTMLFormElement>;
  submit: () => void;
}) {
  const { t } = useTranslation();
  const provinces: Province[] = provincesData;

  const [provinceValue, setProvinceValue] = useState(address?.province || '');
  const [districtValue, setDistrictValue] = useState(address?.city || '');
  const [wardValue, setWardValue] = useState(address?.streetLine1 || '');

  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<{ name: string }[]>([]);

  useEffect(() => {
    if (provinceValue) {
      const province = provinces.find((p) => p.name === provinceValue);
      setDistricts(province?.districts || []);
      setDistrictValue(''); // reset district
      setWardValue(''); // reset ward
      setWards([]);
    } else {
      setDistricts([]);
      setDistrictValue('');
      setWardValue('');
      setWards([]);
    }
  }, [provinceValue]);

  useEffect(() => {
    if (districtValue) {
      const district = districts.find((d) => d.name === districtValue);
      setWards(district?.wards || []);
      setWardValue('');
    } else {
      setWards([]);
      setWardValue('');
    }
  }, [districtValue, districts]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProvinceValue(e.target.value);
  };
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDistrictValue(e.target.value);
  };
  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setWardValue(e.target.value);
  };

  return (
    <ValidatedForm
      id="editAddressForm"
      validator={validator}
      formRef={formRef}
      method="post"
      onSubmit={submit}
      defaultValues={{
        fullName: address?.fullName || '',
        province: address?.province || '',
        city: address?.city || '',
        streetLine1: address?.streetLine1 || '',
        streetLine2: address?.streetLine2 || '',
        phone: address?.phoneNumber || '',
      }}
      className="max-w-md mx-auto p-4 bg-white rounded "
    >
      <input type="hidden" name="intent" value="updateAddress" />
      <div className="flex flex-col space-y-4">
        <Input label={t('account.fullName')} name="fullName" required autoComplete="full-name" />

        <Select
          name="province"
          label={t('address.province')}
          required
          value={provinceValue}
          onChange={handleProvinceChange}
          className="w-full"
        >
          <option value="" disabled hidden>
            {t('address.selectProvince')}
          </option>
          {provinces.map((province) => (
            <option key={province.name} value={province.name}>
              {province.name}
            </option>
          ))}
        </Select>

        <Select
          name="city"
          label={t('address.district') || 'Quận/huyện'}
          required
          value={districtValue}
          onChange={handleDistrictChange}
          className="w-full"
          disabled={!provinceValue}
        >
          <option value="" disabled hidden>
            {t('address.selectDistrict')}
          </option>
          {districts.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}
            </option>
          ))}
        </Select>

        <Select
          name="streetLine1"
          label={t('address.ward') || 'Phường/xã'}
          required
          value={wardValue}
          onChange={handleWardChange}
          className="w-full"
          disabled={!districtValue}
        >
          <option value="" disabled hidden>
            {t('address.selectWard')}
          </option>
          {wards.map((ward) => (
            <option key={ward.name} value={ward.name}>
              {ward.name}
            </option>
          ))}
        </Select>

        <Input label={t('address.streetLine2')} name="streetLine2" autoComplete="address-line2" />

        <Input label={t('address.phoneNumber')} name="phone" autoComplete="tel" />

        <input type="submit" hidden />
      </div>
    </ValidatedForm>
  );
}
