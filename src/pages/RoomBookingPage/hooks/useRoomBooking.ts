import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useReservationMutationOptions } from '../queries/reservation';
import { RoomFilterParams } from '../utils/filtering';

export function useRoomBooking(filter: RoomFilterParams, onError: (message: string) => void) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const createMutation = useMutation(useReservationMutationOptions(onError));

  const book = () => {
    if (!selectedRoomId) {
      onError('회의실을 선택해주세요.');
      return;
    }
    if (!filter.startTime || !filter.endTime) {
      onError('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    createMutation.mutate({
      roomId: selectedRoomId,
      date: filter.date,
      start: filter.startTime,
      end: filter.endTime,
      attendees: filter.attendees,
      equipment: filter.equipment,
    });
  };

  return { selectedRoomId, setSelectedRoomId, book, isLoading: createMutation.isLoading };
}
