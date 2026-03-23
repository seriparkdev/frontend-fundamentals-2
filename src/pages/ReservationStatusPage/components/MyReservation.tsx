import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, ListRow, Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Reservation, Room } from '_tosslib/server/types';
import { EQUIPMENT_LABELS } from 'domains/reservation/constants/room';
import { cancelReservation } from 'pages/remotes';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Props {
  reservations: Reservation[];
  rooms: Room[];
}

const getRoomName = (rooms: Room[], roomId: string) =>
  rooms.find((room: { id: string; name: string }) => room.id === roomId)?.name ?? roomId;

export function MyReservationList({ reservations, rooms }: Props) {
  const location = useLocation();
  const locationState = location.state as { message?: string } | null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const queryClient = useQueryClient();

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

  const handleCancel = async (id: string) => {
    try {
      await cancelMutation.mutateAsync(id);
      setMessage({ type: 'success', text: '예약이 취소되었습니다.' });
    } catch {
      setMessage({ type: 'error', text: '취소에 실패했습니다.' });
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
    <>
      {/* 메시지 배너 */}
      {message && (
        <SectionPadding>
          <MessageBannerBox messageType={message.type}>
            <Text
              typography="t7"
              fontWeight="medium"
              color={message.type === 'success' ? colors.blue600 : colors.red500}
            >
              {message.text}
            </Text>
          </MessageBannerBox>
          <Spacing size={12} />
        </SectionPadding>
      )}
      <ReservationList>
        {reservations.map(reservation => (
          <ReservationCard key={reservation.id}>
            <ListRow
              contents={
                <ListRow.Text2Rows
                  top={getRoomName(rooms, reservation.roomId)}
                  topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                  bottom={`${reservation.date} ${reservation.start}~${reservation.end} · ${reservation.attendees}명 · ${
                    reservation.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'
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
                      handleCancel(reservation.id);
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
    </>
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

const MessageBannerBox = styled.div<{ messageType: 'success' | 'error' }>`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ messageType }) => (messageType === 'success' ? colors.blue50 : colors.red50)};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionPadding = styled.div`
  padding: 0 24px;
`;
