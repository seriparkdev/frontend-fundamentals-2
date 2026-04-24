import { Select } from '_tosslib/components';
import { TIME_SLOTS } from 'domains/reservation/constants/time';

interface TimeRange {
  minTime: string;
  maxTime: string;
}

interface Props extends TimeRange {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel: string;
}

export function TimeSelect({ value, onChange, ariaLabel, minTime, maxTime }: Props) {
  const slots = TIME_SLOTS.filter(time => {
    if (minTime != null && time < minTime) return false;
    if (maxTime != null && time > maxTime) return false;
    return true;
  });

  return (
    <Select value={value} onChange={onChange} aria-label={ariaLabel}>
      <option value="">선택</option>
      {slots.map(t => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </Select>
  );
}
