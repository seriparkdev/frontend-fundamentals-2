import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Top, Spacing, Border, Button, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS } from 'domains/reservation/constants/room';
import { AvailableRooms } from './components/AvailableRooms';
import { TimeSelect } from './components/TimeSelect';
import { NumberSelect } from './components/NumberSelect';
import { ToggleGroup } from './components/ToggleGroup';
import { useFilter } from './hooks/useFilter';
import { useAvailableRooms } from './hooks/useAvailableRooms';
import { useRoomBooking } from './hooks/useRoomBooking';
import { DatePicker } from 'components/DatePicker';
import { useQuery } from '@tanstack/react-query';
import { getReservations, getRooms } from 'pages/remotes';
import { getFloor } from './utils/filtering';

export function RoomBookingPage() {
  const navigate = useNavigate();

  const [filter, setFilter] = useFilter();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFilterChange = () => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', filter.date], () => getReservations(filter.date), {
    enabled: !!filter.date,
  });

  const { availableRooms, isFilterComplete, validationError } = useAvailableRooms(filter, rooms, reservations);
  const { selectedRoomId, setSelectedRoomId, book } = useRoomBooking(filter, setErrorMessage);

  return (
    <PageWrapper>
      <BackButtonWrapper>
        <BackButton type="button" onClick={() => navigate('/')} aria-label="뒤로가기">
          ← 예약 현황으로
        </BackButton>
      </BackButtonWrapper>
      <Top.Top03
        css={css`
          padding-left: 24px;
          padding-right: 24px;
        `}
      >
        예약하기
      </Top.Top03>

      {errorMessage && (
        <SectionPadding>
          <Spacing size={12} />
          <ErrorBanner>
            <Text typography="t7" fontWeight="medium" color={colors.red500}>
              {errorMessage}
            </Text>
          </ErrorBanner>
        </SectionPadding>
      )}

      <Spacing size={24} />

      <SectionPadding>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        <FieldColumn>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            날짜
          </Text>
          <DatePicker
            value={filter.date}
            onChange={e => {
              setFilter({ date: e.target.value });
              handleFilterChange();
            }}
          />
        </FieldColumn>
        <Spacing size={14} />

        <TimeRow>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              시작 시간
            </Text>
            <TimeSelect
              value={filter.startTime}
              onChange={e => {
                setFilter({ startTime: e.target.value });
                handleFilterChange();
              }}
              minTime="09:00"
              maxTime="19:30"
              ariaLabel="시작 시간"
            />
          </TimeField>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              종료 시간
            </Text>
            <TimeSelect
              value={filter.endTime}
              onChange={e => {
                setFilter({ endTime: e.target.value });
                handleFilterChange();
              }}
              minTime="09:30"
              maxTime="20:00"
              ariaLabel="종료 시간"
            />
          </TimeField>
        </TimeRow>
        <Spacing size={14} />

        <TimeRow>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              참석 인원
            </Text>
            <StyledInput
              type="number"
              min={1}
              value={filter.attendees}
              onChange={e => {
                setFilter({ attendees: Math.max(1, Number(e.target.value)) });
                handleFilterChange();
              }}
              aria-label="참석 인원"
            />
          </TimeField>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              선호 층
            </Text>
            <NumberSelect
              value={filter.preferredFloor}
              label="층"
              onChange={val => {
                setFilter({ preferredFloor: val });
                handleFilterChange();
              }}
              options={getFloor(rooms)}
              ariaLabel="선호 층"
            />
          </TimeField>
        </TimeRow>
        <Spacing size={14} />

        <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
          필요 장비
        </Text>
        <Spacing size={8} />
        <ToggleGroup
          options={ALL_EQUIPMENT}
          value={filter.equipment}
          onChange={equipment => {
            setFilter({ equipment });
            handleFilterChange();
          }}
          getLabel={eq => EQUIPMENT_LABELS[eq]}
        />
      </SectionPadding>

      {validationError && (
        <SectionPadding>
          <Spacing size={8} />
          <ValidationErrorSpan role="alert">{validationError}</ValidationErrorSpan>
        </SectionPadding>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {isFilterComplete && (
        <SectionPadding>
          <RoomCountHeader>
            <Text typography="t5" fontWeight="bold" color={colors.grey900}>
              예약 가능 회의실
            </Text>
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {availableRooms.length}개
            </Text>
          </RoomCountHeader>
          <Spacing size={16} />

          <AvailableRooms
            availableRooms={availableRooms}
            selectedRoomId={selectedRoomId}
            onRoomClick={setSelectedRoomId}
          />

          <Spacing size={16} />
          <Button display="full" onClick={book}>
            확정
          </Button>
        </SectionPadding>
      )}

      <Spacing size={24} />
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  background: ${colors.white};
  padding-bottom: 40px;
`;

const BackButtonWrapper = styled.div`
  padding: 12px 24px 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  color: ${colors.grey600};
  &:hover {
    color: ${colors.grey900};
  }
`;

const SectionPadding = styled.div`
  padding: 0 24px;
`;

const ErrorBanner = styled.div`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${colors.red50};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FieldColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TimeRow = styled.div`
  display: flex;
  gap: 12px;
`;

const TimeField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
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

const ValidationErrorSpan = styled.span`
  color: ${colors.red500};
  font-size: 14px;
`;

const RoomCountHeader = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
`;
