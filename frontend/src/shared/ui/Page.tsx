import styled from "styled-components";
import type { PropsWithChildren } from "react";

export const Page = ({ children }: PropsWithChildren) => {
  return <Root>{children}</Root>;
};

const Root = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
