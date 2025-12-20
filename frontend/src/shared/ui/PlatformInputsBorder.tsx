import type { ReactNode } from "react";
import { useIsApplePlatform } from "@/shared/helpers/useIsApplePlatform";
import styled from "styled-components";

interface PlatformInputsBorderProps {
  children: ReactNode;
  className?: string; // если захочешь навесить свой доп. класс на wrapper
}

export function PlatformInputsBorder({
  children,
  className,
}: PlatformInputsBorderProps) {
  const isApple = useIsApplePlatform();

    if (!isApple) {
      return <>{children}</>;
    }

  return (
    <SBorder
      className={["ios-input-wrapper", className].filter(Boolean).join(" ")}
    >
      {children}
    </SBorder>
  );
}

const SBorder = styled.div`
  border-radius: 14px;
  box-sizing: border-box;
  border: 3px solid #ffff;
`;
