import { Room } from '_tosslib/server/types';

export const getRoomName = (rooms: Room[], roomId: Room['id']) =>
  rooms.find(room => room.id === roomId)?.name ?? roomId;
