import React, { KeyboardEvent } from "react";
import styled, { css } from "styled-components";

import PlusIcon from "@/assets/icons/plusIcon.svg?react";
import CrossIcon from "@/assets/icons/crossIcon.svg?react";
import CaptainIcon from "@/assets/icons/captainIcon.svg?react";
import DeleteIcon from "@/assets/icons/deleteIcon.svg?react";
import EditIcon from "@/assets/icons/editIcon.svg?react";
import InviteIcon from "@/assets/icons/inviteIcon.svg?react";
import LeaveTeamIcon from "@/assets/icons/leaveTeamIcon.svg?react";
import SentInviteIcon from "@/assets/icons/sentInvite.svg?react";
import ShareIcon from "@/assets/icons/shareIcon.svg?react";
import HackathonPrizeIcon from "@/assets/icons/hackathonCard/hackathonPrizeIcon.svg?react";
import HackathonDateIcon from "@/assets/icons/hackathonCard/hackathonDateIcon.svg?react";
import HackathonPlaceIcon from "@/assets/icons/hackathonCard/hackathonPlaceIcon.svg?react";
import HackathonRegistrationIcon from "@/assets/icons/hackathonCard/hackathonRegistrationIcon.svg?react";
import HackathonTeamIcon from "@/assets/icons/hackathonCard/hackathonTeamIcon.svg?react";
import ProfileIcon from "@/assets/icons/navbarIcons/ProfileIcon.svg?react";
import HackathonNavIcon from "@/assets/icons/navbarIcons/HackathonsIcon.svg?react";
import TeamNavIcon from "@/assets/icons/navbarIcons/TeamsIcon.svg?react";
import ApplicationsNavIcon from "@/assets/icons/navbarIcons/ApplicationsIcon.svg?react"
// type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;
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

/**
 * Регистрируем иконки по коротким именам
 */
const iconsMap = {
  plus: PlusIcon,
  cross: CrossIcon,
  captain: CaptainIcon,
  delete: DeleteIcon,
  edit: EditIcon,
  invite: InviteIcon,
  leaveTeam: LeaveTeamIcon,
  sentInvite: SentInviteIcon,
  share: ShareIcon,
  hackathonPrize: HackathonPrizeIcon,
  hackathonDate: HackathonDateIcon,
  hackathonPlace: HackathonPlaceIcon,
  hackathonRegistration: HackathonRegistrationIcon,
  hackathonTeam: HackathonTeamIcon,
  profile: ProfileIcon,
  hackNav: HackathonNavIcon,
  appNav: ApplicationsNavIcon,
  teamNav: TeamNavIcon
};

export type IconName = keyof typeof iconsMap;

export type SIconProps = {
  name: IconName;
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
  name,
  size = "m",
  color,
  clickable,
  asButton,
  className,
  title,
  onClick,
  onKeyDown,
  ...rest
}) => {
  const px = toPx(size);
  const Icon = iconsMap[name];

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
      <Icon width={px} height={px} focusable={false} />
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
  color: ${({ $color }) => $color ?? "var(--tg-theme-text-color)"};

  & > svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  & > svg * {
    fill: transparent;
    stroke: currentColor;
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
