import styled from 'styled-components';
import { Text } from '@telegram-apps/telegram-ui';
import { FC } from 'react';

interface NoItemsProps {
  title?: string;
}

export const NoItems: FC<NoItemsProps> = ({ title = 'Ничего не найдено :(' }) => {
  return (
    <NotFound>
      <Text>{title}</Text>
    </NotFound>
  );
};

const NotFound = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
`;
