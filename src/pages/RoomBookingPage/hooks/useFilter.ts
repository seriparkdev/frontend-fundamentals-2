import { useSearchParams } from 'react-router-dom';
import { Equipment } from '_tosslib/server/types';
import { formatDate } from 'domains/reservation/utils/time';

interface FilterState {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
}

const today = formatDate(new Date());

const serializeValue = (value: NonNullable<FilterState[keyof FilterState]>): string | null =>
  Array.isArray(value) ? (value.length > 0 ? value.join(',') : null) : String(value);

const parseFilter = (params: URLSearchParams): FilterState => ({
  date: params.get('date') ?? today,
  startTime: params.get('startTime') ?? '',
  endTime: params.get('endTime') ?? '',
  attendees: Number(params.get('attendees') ?? 1),
  equipment: params.get('equipment')?.split(',').filter(Boolean) as Equipment[] ?? [],
  preferredFloor: params.has('preferredFloor') ? Number(params.get('preferredFloor')) : null,
});

const applyPartial = (prev: URLSearchParams, partial: Partial<FilterState>): URLSearchParams =>
  Object.entries(partial).reduce((next, [key, value]) => {
    const serialized = value != null ? serializeValue(value) : null;
    serialized != null ? next.set(key, serialized) : next.delete(key);
    return next;
  }, new URLSearchParams(prev));

export const useFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = parseFilter(searchParams);
  const setFilter = (partial: Partial<FilterState>) =>
    setSearchParams(prev => applyPartial(prev, partial), { replace: true });

  return [filter, setFilter] as const;
};
