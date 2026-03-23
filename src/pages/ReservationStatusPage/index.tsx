import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, getMyReservations, cancelReservation } from 'pages/remotes';
import { EQUIPMENT_LABELS } from 'domains/reservation/constants/room';
import { HOUR_LABELS, TIMELINE_START, TOTAL_MINUTES } from 'domains/reservation/constants/time';
import { formatDate } from 'domains/reservation/utils/date';

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (h - TIMELINE_START) * 60 + m;
}

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(formatDate(new Date()));

  const locationState = location.state as { message?: string } | null;
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    locationState?.message ? { type: 'success', text: locationState.message } : null
  );

  useEffect(() => {
    if (locationState?.message) {
      window.history.replaceState({}, '');
    }
  }, [locationState]);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });
  const { data: myReservationList = [] } = useQuery(['myReservations'], getMyReservations);

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

  const [activeReservation, setActiveReservation] = useState<string | null>(null);

  const getRoomName = (roomId: string) =>
    rooms.find((r: { id: string; name: string }) => r.id === roomId)?.name ?? roomId;

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
          {rooms.map((room: { id: string; name: string }, index: number) => {
            const roomReservations = reservations.filter((r: { roomId: string }) => r.roomId === room.id);
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
                  {roomReservations.map(
                    (res: { id: string; start: string; end: string; attendees: number; equipment: string[] }) => {
                      const left = (timeToMinutes(res.start) / TOTAL_MINUTES) * 100;
                      const width = ((timeToMinutes(res.end) - timeToMinutes(res.start)) / TOTAL_MINUTES) * 100;
                      const isActive = activeReservation === res.id;
                      return (
                        <ReservationBlockWrapper key={res.id} leftPercent={left} widthPercent={width}>
                          <ReservationBarButton
                            role="button"
                            aria-label={`${room.name} ${res.start}-${res.end} 예약 상세`}
                            isActive={isActive}
                            onClick={() => setActiveReservation(isActive ? null : res.id)}
                          />
                          {isActive && (
                            <TooltipBox role="tooltip">
                              <div>
                                {res.start} ~ {res.end}
                              </div>
                              <div>{res.attendees}명</div>
                              {res.equipment.length > 0 && (
                                <div>{res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ')}</div>
                              )}
                            </TooltipBox>
                          )}
                        </ReservationBlockWrapper>
                      );
                    }
                  )}
                </TimelineBar>
              </RoomRow>
            );
          })}
        </TimelineContainer>
      </SectionPadding>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

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

        {myReservationList.length === 0 ? (
          <EmptyState>
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </EmptyState>
        ) : (
          <ReservationList>
            {myReservationList.map(
              (res: {
                id: string;
                roomId: string;
                date: string;
                start: string;
                end: string;
                attendees: number;
                equipment: string[];
              }) => (
                <ReservationCard key={res.id}>
                  <ListRow
                    contents={
                      <ListRow.Text2Rows
                        top={getRoomName(res.roomId)}
                        topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                        bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${
                          res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'
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
                            handleCancel(res.id);
                          }
                        }}
                      >
                        취소
                      </Button>
                    }
                  />
                </ReservationCard>
              )
            )}
          </ReservationList>
        )}
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

const MessageBannerBox = styled.div<{ messageType: 'success' | 'error' }>`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ messageType }) => (messageType === 'success' ? colors.blue50 : colors.red50)};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

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
