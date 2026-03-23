import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Top, Spacing, Border, Button, Text, Select, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { getRooms, getReservations, createReservation } from 'pages/remotes';
import axios from 'axios';
import { ALL_EQUIPMENT, EQUIPMENT_LABELS } from 'constants/equipment';
import { TIME_SLOTS } from 'constants/time';
import { formatDate } from 'utils/date';

export function RoomBookingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '');
  const [attendees, setAttendees] = useState(Number(searchParams.get('attendees')) || 1);
  const [equipment, setEquipment] = useState<string[]>(
    searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) : []
  );
  const [preferredFloor, setPreferredFloor] = useState<number | null>(
    searchParams.get('floor') ? Number(searchParams.get('floor')) : null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL 쿼리 파라미터 동기화
  useEffect(() => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (attendees > 1) params.attendees = String(attendees);
    if (equipment.length > 0) params.equipment = equipment.join(',');
    if (preferredFloor !== null) params.floor = String(preferredFloor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipment, preferredFloor, setSearchParams]);

  const { data: rooms = [] } = useQuery(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
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

  // 입력 검증
  let validationError: string | null = null;
  const hasTimeInputs = startTime !== '' && endTime !== '';
  if (hasTimeInputs) {
    if (endTime <= startTime) {
      validationError = '종료 시간은 시작 시간보다 늦어야 합니다.';
    } else if (attendees < 1) {
      validationError = '참석 인원은 1명 이상이어야 합니다.';
    }
  }
  const isFilterComplete = hasTimeInputs && !validationError;

  // 필터링
  const floors = [...new Set(rooms.map((r: { floor: number }) => r.floor))].sort((a: number, b: number) => a - b);

  const availableRooms = isFilterComplete
    ? rooms
        .filter((room: { id: string; capacity: number; equipment: string[]; floor: number }) => {
          if (room.capacity < attendees) return false;
          if (!equipment.every(eq => room.equipment.includes(eq))) return false;
          if (preferredFloor !== null && room.floor !== preferredFloor) return false;
          const hasConflict = reservations.some(
            (r: { roomId: string; date: string; start: string; end: string }) =>
              r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
          );
          if (hasConflict) return false;
          return true;
        })
        .sort((a: { floor: number; name: string }, b: { floor: number; name: string }) => {
          if (a.floor !== b.floor) return a.floor - b.floor;
          return a.name.localeCompare(b.name);
        })
    : [];

  const handleBook = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId: selectedRoomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
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
            value={date}
            min={formatDate(new Date())}
            onChange={e => {
              setDate(e.target.value);
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
              value={startTime}
              onChange={e => {
                setStartTime(e.target.value);
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
              value={endTime}
              onChange={e => {
                setEndTime(e.target.value);
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
              value={attendees}
              onChange={e => {
                setAttendees(Math.max(1, Number(e.target.value)));
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
              value={preferredFloor ?? ''}
              onChange={e => {
                const val = e.target.value;
                setPreferredFloor(val === '' ? null : Number(val));
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
              const selected = equipment.includes(eq);
              return (
                <EquipmentButton
                  key={eq}
                  type="button"
                  isSelected={selected}
                  onClick={() => {
                    const next = selected ? equipment.filter(e => e !== eq) : [...equipment, eq];
                    setEquipment(next);
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

          {availableRooms.length === 0 ? (
            <EmptyState>
              <Text typography="t6" color={colors.grey500}>
                조건에 맞는 회의실이 없습니다.
              </Text>
            </EmptyState>
          ) : (
            <RoomList>
              {availableRooms.map(
                (room: { id: string; name: string; floor: number; capacity: number; equipment: string[] }) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <RoomCard
                      key={room.id}
                      isSelected={isSelected}
                      onClick={() => setSelectedRoomId(room.id)}
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
                }
              )}
            </RoomList>
          )}

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
