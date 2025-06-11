import React, { SelectHTMLAttributes } from 'react';
import { useField } from 'remix-validated-form';
import FormElement from './FormElement';
import { useTranslation } from 'react-i18next';

export type SelectProps = {
  placeholder?: string;
  noPlaceholder?: boolean;
  label?: string;
  name: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      name,
      label,
      required,
      defaultValue,
      placeholder = '',
      noPlaceholder = false,
      children,
      onChange,
      ...props
    },
    ref
  ) => {
    const { getInputProps } = useField(name);
    const { t } = useTranslation();

    // Nếu bạn muốn xử lý hoặc log gì đó trước khi gọi onChange gốc, có thể tạo 1 handler ở đây
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <FormElement name={name} label={label} required={required}>
        <select
          ref={ref}
          {...props}
          {...getInputProps({})}
          onChange={handleChange} // dùng handler ở đây
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        >
          {!noPlaceholder && <option value="">{placeholder ?? t('common.select')}</option>}
          {children}
        </select>
      </FormElement>
    );
  }
);
