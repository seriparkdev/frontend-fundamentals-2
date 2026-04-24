import styled from '@emotion/styled';
import { Spacing, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { Message } from '../hooks/useReservationMessage';

interface Props {
  message: Message;
}

export function MessageBanner({ message }: Props) {
  if (message == null) {
    return null;
  }

  return (
    <>
      <MessageBannerBox messageType={message.type}>
        <Text typography="t7" fontWeight="medium" color={message.type === 'success' ? colors.blue600 : colors.red500}>
          {message.text}
        </Text>
      </MessageBannerBox>
      <Spacing size={12} />
    </>
  );
}

const MessageBannerBox = styled.div<{ messageType: 'success' | 'error' }>`
  padding: 10px 14px;
  border-radius: 10px;
  background: ${({ messageType }) => (messageType === 'success' ? colors.blue50 : colors.red50)};
  display: flex;
  align-items: center;
  gap: 8px;
`;
