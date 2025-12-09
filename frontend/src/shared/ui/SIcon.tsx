import React, { ComponentType, SVGProps, KeyboardEvent } from "react";
import styled, { css } from "styled-components";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type SizeToken = "s" | "m" | "l" | "xl";

const SIZE_MAP: Record<SizeToken, number> = {
  s: 16,
  m: 20,
  l: 24,
  xl: 28,
};

function toPx(size?: number | SizeToken): number {
  if (typeof size === "number") return size;
  return SIZE_MAP[size ?? "m"];
}

export type SIconProps = {
  icon: IconComponent | string;
  size?: number | SizeToken;
  color?: string;
  clickable?: boolean;
  asButton?: boolean;
  className?: string;
  title?: string;
  "aria-label"?: string;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLSpanElement>;
};

export const SIcon: React.FC<SIconProps> = ({
  icon,
  size = "m",
  color,                // без значения по умолчанию
  clickable,
  asButton,
  className,
  title,
  onClick,
  onKeyDown,
  ...rest
}) => {
  const px = toPx(size);
  const isComponent = typeof icon !== "string";
  const ariaHidden =
    !title && !rest["aria-label"] ? { "aria-hidden": true } : {};

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (!asButton) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      (e.currentTarget as HTMLSpanElement).click();
    }
    onKeyDown?.(e);
  };

  return (
    <Wrap
      $size={px}
      $color={color}
      $clickable={!!clickable || !!asButton}
      role={asButton ? "button" : undefined}
      tabIndex={asButton ? 0 : undefined}
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      title={title}
      {...ariaHidden}
      {...rest}
    >
      {isComponent ? (
        React.createElement(icon as IconComponent, {
          width: px,
          height: px,
          focusable: false,
        })
      ) : (
        <img src={icon as string} alt={rest["aria-label"] ?? title ?? ""} />
      )}
    </Wrap>
  );
};

const Wrap = styled.span<{
  $size: number;
  $color?: string;
  $clickable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;

  /* цвет обводки берём из темы (или из пропса) */
  color: ${({ $color }) => $color ?? "var(--tg-theme-text-color)"};


  & > svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* все элементы внутри svg: заливка прозрачная, обводка = currentColor */
  & > svg * {
    fill: transparent;
    stroke: currentColor;
  }

  & > img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
  }


  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
      border-radius: 9999px;
      &:hover {
        opacity: 0.9;
      }
      &:active {
        opacity: 0.8;
        transform: translateY(0.5px);
      }
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: 2px;
      }
    `}
`;
