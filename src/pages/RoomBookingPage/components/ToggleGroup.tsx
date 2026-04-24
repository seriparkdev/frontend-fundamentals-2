import styled from '@emotion/styled';
import { colors } from '_tosslib/constants/colors';

interface Props<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string;
}

export function ToggleGroup<T>({ options, value, onChange, getLabel }: Props<T>) {
  const toggle = (option: T) => {
    const isSelected = value.includes(option);
    onChange(isSelected ? value.filter(v => v !== option) : [...value, option]);
  };

  return (
    <Row>
      {options.map((option, i) => {
        const isSelected = value.includes(option);
        return (
          <Button
            key={i}
            type="button"
            isSelected={isSelected}
            onClick={() => toggle(option)}
            aria-pressed={isSelected}
            aria-label={getLabel(option)}
          >
            {getLabel(option)}
          </Button>
        );
      })}
    </Row>
  );
}

const Row = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ isSelected: boolean }>`
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
