import { Reservation, Room } from '_tosslib/server/types';
import { RoomFilterParams, getValidationErrorMessage, isAvilableRoom, sortByFloorAscAndName } from '../utils/filtering';

export function useAvailableRooms(filter: RoomFilterParams, rooms: Room[], reservations: Reservation[]) {
  const hasTimeInputs = filter.startTime !== '' && filter.endTime !== '';
  const validationError = getValidationErrorMessage(hasTimeInputs, filter);
  const isFilterComplete = hasTimeInputs && !validationError;

  const availableRooms = isFilterComplete
    ? rooms.filter(room => isAvilableRoom(room, filter, reservations)).sort(sortByFloorAscAndName)
    : [];

  return { availableRooms, isFilterComplete, validationError };
}
