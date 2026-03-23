import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { colors } from '_tosslib/constants/colors';
import { Room } from '_tosslib/server/types';
import { EQUIPMENT_LABELS } from 'domains/reservation/constants/room';
import { HOUR_LABELS, TIMELINE_START, TOTAL_MINUTES } from 'domains/reservation/constants/time';
import { getReservations } from 'pages/remotes';
import { useState } from 'react';
import { Text } from '_tosslib/components';

interface Props {
  rooms: Room[];
  date: string;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

export function RoomTimeline({ rooms, date }: Props) {
  const [activeReservation, setActiveReservation] = useState<string | null>(null);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });

  return (
    <TimelineContainer>
      {/* 시간 헤더 */}
      <TimeHeaderRow>
        <RoomLabelCell />
        <TimeLabelArea>
          {HOUR_LABELS.map(t => {
            const left = (timeToMinutes(t) / TOTAL_MINUTES) * 100;
            return (
              <Text
                key={t}
                typography="t7"
                fontWeight="regular"
                color={colors.grey400}
                css={css`
                  position: absolute;
                  left: ${left}%;
                  transform: translateX(-50%);
                  font-size: 10px;
                  letter-spacing: -0.3px;
                `}
              >
                {t.slice(0, 2)}
              </Text>
            );
          })}
        </TimeLabelArea>
      </TimeHeaderRow>

      {/* 회의실별 타임라인 */}
      {rooms.map((room, index) => {
        const roomReservations = reservations.filter(r => r.roomId === room.id);
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
              {roomReservations.map(reservation => {
                const left = (timeToMinutes(reservation.start) / TOTAL_MINUTES) * 100;
                const width =
                  ((timeToMinutes(reservation.end) - timeToMinutes(reservation.start)) / TOTAL_MINUTES) * 100;
                const isActive = activeReservation === reservation.id;
                return (
                  <ReservationBlockWrapper key={reservation.id} leftPercent={left} widthPercent={width}>
                    <ReservationBarButton
                      role="button"
                      aria-label={`${room.name} ${reservation.start}-${reservation.end} 예약 상세`}
                      isActive={isActive}
                      onClick={() => setActiveReservation(isActive ? null : reservation.id)}
                    />
                    {isActive && (
                      <TooltipBox role="tooltip">
                        <div>
                          {reservation.start} ~ {reservation.end}
                        </div>
                        <div>{reservation.attendees}명</div>
                        {reservation.equipment.length > 0 && (
                          <div>{reservation.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ')}</div>
                        )}
                      </TooltipBox>
                    )}
                  </ReservationBlockWrapper>
                );
              })}
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

const ReservationBlockWrapper = styled.div<{ leftPercent: number; widthPercent: number }>`
  position: absolute;
  left: ${({ leftPercent }) => leftPercent}%;
  width: ${({ widthPercent }) => widthPercent}%;
  height: 100%;
`;

const ReservationBarButton = styled.div<{ isActive: boolean }>`
  width: 100%;
  height: 100%;
  background: ${colors.blue400};
  border-radius: 4px;
  opacity: ${({ isActive }) => (isActive ? 1 : 0.75)};
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
`;

const TooltipBox = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 6px;
  background: ${colors.grey900};
  color: ${colors.white};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  line-height: 1.6;
`;
