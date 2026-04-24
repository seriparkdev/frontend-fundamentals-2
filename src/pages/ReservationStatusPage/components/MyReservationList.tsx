import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ListRow, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Reservation, Room } from '_tosslib/server/types';
import { getEquipmentListText } from 'domains/reservation/utils/room';
import { cancelReservation as CancelReservationApi } from 'pages/remotes';
import { Message } from '../hooks/useReservationMessage';
import { getRoomName } from '../utils/reservation';

interface Props {
  reservations: Reservation[];
  rooms: Room[];
  onMessageChange: (message: Message) => void;
}

export function MyReservationList({ reservations, rooms, onMessageChange }: Props) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation((id: string) => CancelReservationApi(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

  const cancelReservation = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      onMessageChange({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      onMessageChange({ type: 'error', text: '취소에 실패했습니다.' });
    }
  };

  if (reservations.length === 0) {
    return (
      <EmptyState>
        <Text typography="t6" color={colors.grey500}>
          예약 내역이 없습니다.
        </Text>
      </EmptyState>
    );
  }

  return (
    <ReservationList>
      {reservations.map(reservation => (
        <ReservationCard key={reservation.id}>
          <ListRow
            contents={
              <ListRow.Text2Rows
                top={getRoomName(rooms, reservation.roomId)}
                topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                bottom={`${reservation.date} ${reservation.start}~${reservation.end} · ${reservation.attendees}명 · ${
                  getEquipmentListText(reservation.equipment) || '장비 없음'
                }`}
                bottomProps={{ typography: 't7', color: colors.grey600 }}
              />
            }
            right={
              <Button
                type="danger"
                style="weak"
                size="small"
                onClick={e => {
                  e.stopPropagation();
                  if (window.confirm('정말 취소하시겠습니까?')) {
                    cancelReservation(reservation.id);
                  }
                }}
              >
                취소
              </Button>
            }
          />
        </ReservationCard>
      ))}
    </ReservationList>
  );
}

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  background: ${colors.grey50};
  border-radius: 14px;
`;

const ReservationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ReservationCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  background: ${colors.grey50};
  border: 1px solid ${colors.grey200};
`;
