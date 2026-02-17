import { Children, FC, ReactNode } from 'react';
import styled from 'styled-components';

interface ButtonsSectionProps {
  children: ReactNode;
}

export const ButtonsSection: FC<ButtonsSectionProps> = ({ children }) => {
  const childCount = Children.count(children);
  return (
    <>
      <div style={{ height: childCount * 42 }}></div>
      <SButtonsSection>{children}</SButtonsSection>
    </>
  );
};

const SButtonsSection = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 0.5rem;
  position: fixed;
  bottom: 4.5rem;
  left: 1rem;
  width: calc(100% - 2rem);
  z-index: 1;
`;
