import { Select } from '_tosslib/components';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  options: number[];
  ariaLabel: string;
  label?: string;
  placeholder?: string;
}

export function NumberSelect({ value, onChange, options, ariaLabel, label, placeholder = '전체' }: Props) {
  return (
    <Select
      value={value ?? ''}
      onChange={e => {
        const val = e.target.value;
        onChange(val === '' ? null : Number(val));
      }}
      aria-label={ariaLabel}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>
          {opt}
          {label}
        </option>
      ))}
    </Select>
  );
}
