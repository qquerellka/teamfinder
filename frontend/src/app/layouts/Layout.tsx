import { Suspense, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { FixedLayout } from "@telegram-apps/telegram-ui";
import { Navbar } from "../../widgets/Navbar";
import BackButtonController from "./BackButtonController";
import { LoaderPage } from "@/shared/ui/LoaderPage";

export default function RootLayout() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [initialHeight] = useState(window.innerHeight);

  // логика клавиатуры + --vh
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;

      document.documentElement.style.setProperty(
        "--vh",
        `${currentHeight * 0.01}px`
      );

      const heightDifference = initialHeight - currentHeight;
      setIsKeyboardVisible(heightDifference > 200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initialHeight]);

  const [footerHeight, setFooterHeight] = useState(0);

  const footerRef = (node: HTMLDivElement | null) => {
    if (node !== null) {
      const rect = node.getBoundingClientRect();
      setFooterHeight(rect.height);
    }
  };
  return (
    <Suspense fallback={<LoaderPage />}>
      <BackButtonController />
      <SRoot>
        <SContent $top={0} $bottom={footerHeight}>
          <Outlet />
        </SContent>

        <SFooterFixed style={{ display: isKeyboardVisible ? "none" : "block" }}>
          <SFooterInner ref={footerRef}>
            <Navbar />
          </SFooterInner>
        </SFooterFixed>
      </SRoot>
    </Suspense>
  );
}

const SRoot = styled.div`
  position: relative;
  min-height: calc(var(--vh, 1vh) * 100);
  max-width: 640px;
  margin: 0 auto;
  background: var(--tg-theme-bg-color, #fff);
  padding: 1rem;
  display: flex;
  flex-direction: column;
`;

const SContent = styled.div<{ $top: number; $bottom: number }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: ${({ $top }) => $top + 12}px;
  padding-bottom: ${({ $bottom }) => $bottom + 12}px;
`;

const SFooterFixed = styled(FixedLayout).attrs({
  vertical: "bottom",
  Component: "footer",
})``;

const SFooterInner = styled.div`
  border-radius: 1rem 1rem 0 0;
  background: var(--tg-theme-section-bg-color, #fff);
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
`;
