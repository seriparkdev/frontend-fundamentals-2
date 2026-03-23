import { useQueryStates, parseAsString, parseAsInteger, createParser } from 'nuqs';
import { Equipment } from '_tosslib/server/types';
import { formatDate } from 'domains/reservation/utils/time';

const parseAsCommaSeparatedArray = createParser<Equipment[]>({
  parse(v: string) {
    return v.split(',').filter(Boolean) as Equipment[];
  },
  serialize(v: string[]) {
    return v.join(',');
  },
});

const filterParsers = {
  date: parseAsString.withDefault(formatDate(new Date())),
  startTime: parseAsString.withDefault(''),
  endTime: parseAsString.withDefault(''),
  attendees: parseAsInteger.withDefault(1),
  equipment: parseAsCommaSeparatedArray.withDefault([]),
  preferredFloor: parseAsInteger,
};

export const useFilter = () => {
  return useQueryStates(filterParsers);
};
