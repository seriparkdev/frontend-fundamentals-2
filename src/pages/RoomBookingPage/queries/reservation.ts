import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { Reservation } from '_tosslib/server/types';
import axios from 'axios';
import { createReservation } from 'pages/remotes';
import { useNavigate } from 'react-router-dom';

export const useReservationMutationOptions = (
  onResult: (message: string) => void
): UseMutationOptions<Awaited<ReturnType<typeof createReservation>>, unknown, Omit<Reservation, 'id'>> => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return {
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries(['reservations', variables.date]);
      queryClient.invalidateQueries(['myReservations']);

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      onResult(errResult.message ?? '예약에 실패했습니다.');
    },
    onError: (err: unknown) => {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      onResult(serverMessage);
    },
  };
};
