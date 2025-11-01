import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { FixedLayout, Spinner } from "@telegram-apps/telegram-ui";
import { Navbar } from "../widgets/Navbar";
import BackButtonController from "./BackButtonController";

export default function RootLayout() {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [offsets, setOffsets] = useState({ top: 0, bottom: 0 });

  useLayoutEffect(() => {
    const measure = () =>
      setOffsets({
        top: topRef.current?.offsetHeight ?? 0,
        bottom: bottomRef.current?.offsetHeight ?? 0,
      });

    measure();
    const roTop = new ResizeObserver(measure);
    const roBottom = new ResizeObserver(measure);
    if (topRef.current) roTop.observe(topRef.current);
    if (bottomRef.current) roBottom.observe(bottomRef.current);

    window.addEventListener("resize", measure);
    return () => {
      roTop.disconnect();
      roBottom.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const setVH = () =>
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  function PageFallback() {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          padding: 12,
        }}
      >
        <Spinner size="l" />
      </div>
    );
  }

  return (
    <Suspense fallback={<PageFallback />}>
      <BackButtonController />
      <SRoot>
        <SContent $top={offsets.top} $bottom={offsets.bottom}>
          <Outlet />
        </SContent>

        <SFooterFixed>
          <SFooterInner ref={bottomRef}>
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
`;

const SFooterFixed = styled(FixedLayout).attrs({
  vertical: "bottom",
  Component: "footer",
})``;

const SFooterInner = styled.div`
  background: var(--tg-theme-section-bg-color, #fff);
  padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
`;

const SContent = styled.div<{ $top: number; $bottom: number }>`
  padding-top: ${({ $top }) => $top + 12}px;
  padding-bottom: ${({ $bottom }) => $bottom + 12}px;
`;
