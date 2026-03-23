import { Reservation, Room } from '_tosslib/server/types';

interface RoomFilterParams {
  attendees: number;
  equipment: string[];
  preferredFloor: number | null;
  date: string;
  startTime: string;
  endTime: string;
  reservations: Reservation[];
}

const hasEnoughCapacity = (room: Room, attendees: Reservation['attendees']) => room.capacity >= attendees;

// TODO: 타입 수정
const hasRequiredEquipment = (room: Room, equipment: string[]) =>
  equipment.every(eq => room.equipment.includes(eq as Room['equipment'][number]));

const hasMatchingFloor = (room: Room, preferredFloor: number | null) =>
  preferredFloor === null || room.floor === preferredFloor;

const hasNoTimeConflict = (
  room: Room,
  { date, startTime, endTime, reservations }: Pick<RoomFilterParams, 'date' | 'startTime' | 'endTime' | 'reservations'>
) => !reservations.some(r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime);

export const getAvailableRooms = (rooms: Room[], params: RoomFilterParams) =>
  rooms
    .filter(
      room =>
        hasEnoughCapacity(room, params.attendees) &&
        hasRequiredEquipment(room, params.equipment) &&
        hasMatchingFloor(room, params.preferredFloor) &&
        hasNoTimeConflict(room, params)
    )
    .sort((a, b) => (a.floor !== b.floor ? a.floor - b.floor : a.name.localeCompare(b.name)));
