import { Text } from '@telegram-apps/telegram-ui';
import styled, { css } from 'styled-components';

type TTextProps = {
  $fs?: number | string;
  $fw?: number | string;
};

const sizeCss = ($fs?: number | string) => {
  if ($fs === undefined) return;
  if (typeof $fs === 'number') {
    return css`
      font-size: ${$fs}px;
      line-height: ${$fs + 4}px;
    `;
  }
  return css`
    font-size: ${$fs};
    line-height: calc(${$fs} + 4px);
  `;
};

export const SText = styled(Text)<TTextProps>`
  && {
    ${({ $fs }) => sizeCss($fs)}
    ${({ $fw }) =>
      $fw !== undefined &&
      css`
        font-weight: ${$fw};
      `}
  }
`;
