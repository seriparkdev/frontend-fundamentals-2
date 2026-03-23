import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, createReservation } from 'pages/remotes';
import axios from 'axios';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS } from 'domains/reservation/constants/room';
import { TIME_SLOTS } from 'domains/reservation/constants/time';
import { formatDate } from 'domains/reservation/utils/date';
import { useQueryStates, parseAsString, parseAsInteger, createParser } from 'nuqs';
import { getAvailableRooms } from './utils/filtering';
import { AvailableRooms } from './components/AvailableRooms';

const parseAsCommaSeparatedArray = createParser({
  parse(v: string) {
    return v.split(',').filter(Boolean);
  },
  serialize(v: string[]) {
    return v.join(',');
  },
});

const filterParsers = {
  date: parseAsString.withDefault(formatDate(new Date())),
  startTime: parseAsString.withDefault(''),
  endTime: parseAsString.withDefault(''),
  attendees: parseAsInteger.withDefault(1),
  equipment: parseAsCommaSeparatedArray.withDefault([]),
  preferredFloor: parseAsInteger,
};

export function RoomBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useQueryStates(filterParsers);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', filter.date], () => getReservations(filter.date), {
    enabled: !!filter.date,
  });

  const createMutation = useMutation(
    (data: { roomId: string; date: string; start: string; end: string; attendees: number; equipment: string[] }) =>
      createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );

  // 필터 변경 시 선택 초기화
  const handleFilterChange = () => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  let validationError: string | null = null;
  const hasTimeInputs = filter.startTime !== '' && filter.endTime !== '';
  if (hasTimeInputs) {
    if (filter.endTime <= filter.startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (filter.attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  // 필터링
  const floors = [...new Set(rooms.map((r: { floor: number }) => r.floor))].sort((a: number, b: number) => a - b);

  const availableRooms = isFilterComplete ? getAvailableRooms(rooms, { ...filter, reservations }) : [];

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    if (!filter.startTime || !filter.endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date: filter.date,
        start: filter.startTime,
        end: filter.endTime,
        attendees: filter.attendees,
        equipment: filter.equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/', { state: { message: '예약이 완료되었습니다!' } });
        return;
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
      setSelectedRoomId(null);
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
      setSelectedRoomId(null);
    }
  };

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

      {/* 예약 조건 입력 */}
      <SectionPadding>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        {/* 날짜 */}
        <FieldColumn>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            날짜
          </Text>
          <StyledInput
            type="date"
            value={filter.date}
            min={formatDate(new Date())}
            onChange={e => {
              setFilter({ date: e.target.value });
              handleFilterChange();
            }}
            aria-label="날짜"
          />
        </FieldColumn>
        <Spacing size={14} />

        {/* 시간 */}
        <TimeRow>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              시작 시간
            </Text>
            <Select
              value={filter.startTime}
              onChange={e => {
                setFilter({ startTime: e.target.value });
                handleFilterChange();
              }}
              aria-label="시작 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(0, -1).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </TimeField>
          <TimeField>
            <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
              종료 시간
            </Text>
            <Select
              value={filter.endTime}
              onChange={e => {
                setFilter({ endTime: e.target.value });
                handleFilterChange();
              }}
              aria-label="종료 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(1).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </TimeField>
        </TimeRow>
        <Spacing size={14} />

        {/* 참석 인원 + 선호 층 */}
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
            <Select
              value={filter.preferredFloor ?? ''}
              onChange={e => {
                const val = e.target.value;
                setFilter({ preferredFloor: val === '' ? null : Number(val) });
                handleFilterChange();
              }}
              aria-label="선호 층"
            >
              <option value="">전체</option>
              {floors.map((f: number) => (
                <option key={f} value={f}>
                  {f}층
                </option>
              ))}
            </Select>
          </TimeField>
        </TimeRow>
        <Spacing size={14} />

        {/* 장비 */}
        <div>
          <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>
            필요 장비
          </Text>
          <Spacing size={8} />
          <EquipmentRow>
            {ALL_EQUIPMENT.map(eq => {
              const selected = filter.equipment.includes(eq);
              return (
                <EquipmentButton
                  key={eq}
                  type="button"
                  isSelected={selected}
                  onClick={() => {
                    const next = selected ? filter.equipment.filter(e => e !== eq) : [...filter.equipment, eq];
                    setFilter({ equipment: next });
                    handleFilterChange();
                  }}
                  aria-label={EQUIPMENT_LABELS[eq]}
                  aria-pressed={selected}
                >
                  {EQUIPMENT_LABELS[eq]}
                </EquipmentButton>
              );
            })}
          </EquipmentRow>
        </div>
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

      {/* 예약 가능 회의실 목록 */}
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
          <Button display="full" onClick={handleBook} disabled={createMutation.isLoading}>
            {createMutation.isLoading ? '예약 중...' : '확정'}
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

const EquipmentRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const EquipmentButton = styled.button<{ isSelected: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey200)};
  background: ${({ isSelected }) => (isSelected ? colors.blue50 : colors.grey50)};
  color: ${({ isSelected }) => (isSelected ? colors.blue600 : colors.grey700)};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  &:hover {
    border-color: ${({ isSelected }) => (isSelected ? colors.blue500 : colors.grey400)};
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
