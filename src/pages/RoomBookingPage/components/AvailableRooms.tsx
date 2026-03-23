import styled from '@emotion/styled';
import { colors } from '_tosslib/constants/colors';
import { Room } from '_tosslib/server/types';
import { Text, ListRow } from '_tosslib/components';
import { EQUIPMENT_LABELS } from 'domains/reservation/constants/room';

interface Props {
  availableRooms: Room[];
  selectedRoomId: string | null;
  onRoomClick: (id: string) => void;
}

export function AvailableRooms({ availableRooms, selectedRoomId, onRoomClick }: Props) {
  if (availableRooms.length === 0) {
    return (
      <EmptyState>
        <Text typography="t6" color={colors.grey500}>
          조건에 맞는 회의실이 없습니다.
        </Text>
      </EmptyState>
    );
  }

  return (
    <RoomList>
      {availableRooms.map(room => {
        const isSelected = selectedRoomId === room.id;
        return (
          <RoomCard
            key={room.id}
            isSelected={isSelected}
            onClick={() => onRoomClick(room.id)}
            role="button"
            aria-pressed={isSelected}
            aria-label={room.name}
          >
            <ListRow
              contents={
                <ListRow.Text2Rows
                  top={room.name}
                  topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                  bottom={`${room.floor}층 · ${room.capacity}명 · ${room.equipment
                    .map((e: string) => EQUIPMENT_LABELS[e])
                    .join(', ')}`}
                  bottomProps={{ typography: 't7', color: colors.grey600 }}
                />
              }
              right={
                isSelected ? (
                  <Text typography="t7" fontWeight="bold" color={colors.blue500}>
                    선택됨
                  </Text>
                ) : undefined
              }
            />
          </RoomCard>
        );
      })}
    </RoomList>
  );
}

const EmptyState = styled.div`
  padding: 40px 0;
  text-align: center;
  background: ${colors.grey50};
  border-radius: 14px;
`;

const RoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const RoomCard = styled.div<{ isSelected: boolean }>`
  cursor: pointer;
  padding: 14px 16px;
  border-radius: 14px;
  border: 2px solid ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey200)};
  background: ${({ isSelected }) => (isSelected ? colors.blue50 : colors.white)};
  transition: all 0.15s;
  &:hover {
    border-color: ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey300)};
  }
`;
