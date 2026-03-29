import styled from '@emotion/styled';
import { colors } from '_tosslib/constants/colors';
import { formatDate } from 'domains/reservation/utils/time';
import React from 'react';

interface Props {
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

export function DatePicker({ value, onChange }: Props) {
  return <StyledInput type="date" value={value} min={formatDate(new Date())} onChange={onChange} aria-label="날짜" />;
}

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
