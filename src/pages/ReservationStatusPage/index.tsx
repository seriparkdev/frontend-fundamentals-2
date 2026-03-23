import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getMyReservations } from 'pages/remotes';

import { formatDate } from 'domains/reservation/utils/time';
import { MyReservationList } from './components/MyReservation';
import { RoomTimeline } from './components/RoomTimeline';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date()));

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: myReservationList = [] } = useQuery(['myReservations'], getMyReservations);

  return (
    <PageWrapper>
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      {/* 날짜 선택 */}
      <SectionPadding>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <FieldColumn>
          <StyledInput
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => setDate(e.target.value)}
            aria-label="날짜"
          />
        </FieldColumn>
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약 현황 타임라인 */}
      <SectionPadding>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 현황
        </Text>
        <Spacing size={16} />

        <RoomTimeline rooms={rooms} date={date} />
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 내 예약 목록 */}
      <SectionPadding>
        <SectionHeader>
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            내 예약
          </Text>
          {myReservationList.length > 0 && (
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {myReservationList.length}건
            </Text>
          )}
        </SectionHeader>
        <Spacing size={16} />

        <MyReservationList reservations={myReservationList} rooms={rooms} />
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <SectionPadding>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </SectionPadding>
      <Spacing size={24} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  background: ${colors.white};
  padding-bottom: 40px;
`;

const SectionPadding = styled.div`
  padding: 0 24px;
`;

const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StyledInput = styled.input`
  box-sizing: border-box;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  height: 48px;
  background-color: ${colors.grey50};
  border-radius: 12px;
  color: ${colors.grey800};
  width: 100%;
  border: 1px solid ${colors.grey200};
  padding: 0 16px;
  outline: none;
  transition: border-color 0.15s;
  &:focus {
    border-color: ${colors.blue500};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;
