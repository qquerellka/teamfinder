import styled from "styled-components";
import { SText } from "./SText";
import { FC } from "react";

interface NoItemsProps {
  title?: string;
}

export const NoItems: FC<NoItemsProps> = ({
  title = "Ничего не найдено :(",
}) => {
  return (
    <NotFound>
      <SText>{title}</SText>
    </NotFound>
  );
};

const NotFound = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align: center;
`;
