import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { colors } from '_tosslib/constants/colors';
import { Room } from '_tosslib/server/types';
import { HOUR_LABELS, TOTAL_MINUTES } from 'domains/reservation/constants/time';
import { getReservations } from 'pages/remotes';
import { Text } from '_tosslib/components';
import { ReservationBlock } from './ReservationBlock';
import { timeToMinutes } from 'domains/reservation/utils/time';

interface Props {
  rooms: Room[];
  date: string;
}

export function RoomTimeline({ rooms, date }: Props) {
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });

  return (
    <TimelineContainer>
      {/* 시간 헤더 */}
      <TimeHeaderRow>
        <RoomLabelCell />
        <TimeLabelArea>
          {HOUR_LABELS.map(t => (
            <Text
              key={t}
              typography="t7"
              fontWeight="regular"
              color={colors.grey400}
              css={css`
                position: absolute;
                left: ${(timeToMinutes(t) / TOTAL_MINUTES) * 100}%;
                transform: translateX(-50%);
                font-size: 10px;
                letter-spacing: -0.3px;
              `}
            >
              {t.slice(0, 2)}
            </Text>
          ))}
        </TimeLabelArea>
      </TimeHeaderRow>

      {/* 회의실별 타임라인 */}
      {rooms.map((room, index) => {
        return (
          <RoomRow key={room.id} isFirst={index === 0}>
            <RoomLabelCell>
              <Text
                typography="t7"
                fontWeight="medium"
                color={colors.grey700}
                ellipsisAfterLines={1}
                css={css`
                  font-size: 12px;
                `}
              >
                {room.name}
              </Text>
            </RoomLabelCell>
            <TimelineBar>
              {reservations
                .filter(r => r.roomId === room.id)
                .map(reservation => (
                  <ReservationBlock room={room} reservation={reservation} />
                ))}
            </TimelineBar>
          </RoomRow>
        );
      })}
    </TimelineContainer>
  );
}

const TimelineContainer = styled.div`
  background: ${colors.grey50};
  border-radius: 14px;
  padding: 16px;
`;

const TimeHeaderRow = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
`;

const RoomLabelCell = styled.div`
  width: 80px;
  flex-shrink: 0;
  padding-right: 8px;
`;

const TimeLabelArea = styled.div`
  flex: 1;
  position: relative;
  height: 18px;
`;

const RoomRow = styled.div<{ isFirst: boolean }>`
  display: flex;
  align-items: center;
  height: 32px;
  ${({ isFirst }) => !isFirst && 'margin-top: 4px;'}
`;

const TimelineBar = styled.div`
  flex: 1;
  height: 24px;
  background: ${colors.white};
  border-radius: 6px;
  position: relative;
  overflow: visible;
`;
