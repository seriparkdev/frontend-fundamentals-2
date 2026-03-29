import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getMyReservations } from 'pages/remotes';

import { formatDate } from 'domains/reservation/utils/time';
import { MyReservationList } from './components/MyReservationList';
import { RoomTimeline } from './components/RoomTimeline';
import { DatePicker } from './components/DatePicker';
import { MessageBanner } from './components/MessageBanner';
import { useReservationMessage } from './hooks/useReservationMessage';

export function ReservationStatusPage() {
  const navigate = useNavigate();

  const [date, setDate] = useState(formatDate(new Date()));

  const { message, setMessage } = useReservationMessage();

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

      <SectionPadding>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          날짜 선택
        </Text>
        <Spacing size={16} />
        <FieldColumn>
          <DatePicker value={date} onChange={e => setDate(e.target.value)} />
        </FieldColumn>
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

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
        <MessageBanner message={message} />
        <Spacing size={12} />

        <MyReservationList reservations={myReservationList} rooms={rooms} onMessageChange={setMessage} />
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

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

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;
