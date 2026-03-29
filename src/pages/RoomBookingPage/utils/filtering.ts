import { Equipment, Reservation, Room } from '_tosslib/server/types';

export interface RoomFilterParams {
  attendees: number;
  equipment: Equipment[];
  preferredFloor: number | null;
  date: string;
  startTime: string;
  endTime: string;
}

const hasEnoughCapacity = (room: Room, attendees: Reservation['attendees']) => room.capacity >= attendees;

const hasRequiredEquipment = (room: Room, equipment: Equipment[]) => equipment.every(eq => room.equipment.includes(eq));

const hasMatchingFloor = (room: Room, preferredFloor: number | null) =>
  preferredFloor === null || room.floor === preferredFloor;

const hasNoTimeConflict = (
  room: Room,
  { date, startTime, endTime }: Pick<RoomFilterParams, 'date' | 'startTime' | 'endTime'>,
  reservations: Reservation[]
) => !reservations.some(r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime);

export const isAvilableRoom = (room: Room, filter: RoomFilterParams, reservations: Reservation[]) =>
  hasEnoughCapacity(room, filter.attendees) &&
  hasRequiredEquipment(room, filter.equipment) &&
  hasMatchingFloor(room, filter.preferredFloor) &&
  hasNoTimeConflict(room, filter, reservations);

export const sortByFloorAscAndName = (a: Room, b: Room) =>
  a.floor !== b.floor ? a.floor - b.floor : a.name.localeCompare(b.name);

export const getValidationErrorMessage = (hasTimeInputs: boolean, filter: RoomFilterParams): string | null => {
  if (hasTimeInputs) {
    if (filter.endTime <= filter.startTime) {
      return '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (filter.attendees < 1) {
      return '참석 인원은 1명 이상이어야 합니다.';
    }
  }

  return null;
};

export const getFloor = (rooms: Room[]) => [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);
