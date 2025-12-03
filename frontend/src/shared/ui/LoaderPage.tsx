import type { FC } from "react";
import styled from "styled-components";
import { Spinner } from "@telegram-apps/telegram-ui";

type LoaderPageProps = {
  text?: string;
  fullHeight?: boolean;
};

export const LoaderPage: FC<LoaderPageProps> = ({
  text = "Загружаем...",
  fullHeight = true,
}) => {
  return (
    <Root $fullHeight={fullHeight}>
      <Spinner size="l" />
      {text && <Text>{text}</Text>}
    </Root>
  );
};

const Root = styled.div<{ $fullHeight: boolean }>`
  min-height: ${({ $fullHeight }) => ($fullHeight ? "60vh" : "auto")};
  width: 100%;
  display: grid;
  place-items: center;
  padding: 12px;
  row-gap: 8px;
`;

const Text = styled.span`
  font-size: 14px;
  opacity: 0.8;
`;
