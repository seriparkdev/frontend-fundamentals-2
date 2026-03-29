import styled from '@emotion/styled';
import { colors } from '_tosslib/constants/colors';
import { Reservation, Room } from '_tosslib/server/types';
import { TOTAL_MINUTES } from 'domains/reservation/constants/time';
import { getEquipmentListText } from 'domains/reservation/utils/room';
import { timeToMinutes } from 'domains/reservation/utils/time';
import { useState } from 'react';

interface Props {
  reservation: Reservation;
  room: Room;
}

export function ReservationBlock({ reservation, room }: Props) {
  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const leftPercent = (timeToMinutes(reservation.start) / TOTAL_MINUTES) * 100;
  const widthPercent = ((timeToMinutes(reservation.end) - timeToMinutes(reservation.start)) / TOTAL_MINUTES) * 100;

  const isActive = activeReservation === reservation.id;

  return (
    <ReservationBlockWrapper key={reservation.id} leftPercent={leftPercent} widthPercent={widthPercent}>
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
          {reservation.equipment.length > 0 && <div>{getEquipmentListText(reservation.equipment)}</div>}
        </TooltipBox>
      )}
    </ReservationBlockWrapper>
  );
}

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
