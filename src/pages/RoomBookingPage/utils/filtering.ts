import { Reservation, Room } from '_tosslib/server/types';

export interface RoomFilterParams {
  attendees: number;
  equipment: string[];
  preferredFloor: number | null;
  date: string;
  startTime: string;
  endTime: string;
}

const hasEnoughCapacity = (room: Room, attendees: Reservation['attendees']) => room.capacity >= attendees;

// TODO: 타입 수정
const hasRequiredEquipment = (room: Room, equipment: string[]) =>
  equipment.every(eq => room.equipment.includes(eq as Room['equipment'][number]));

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
