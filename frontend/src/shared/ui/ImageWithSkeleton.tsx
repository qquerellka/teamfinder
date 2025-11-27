import React, { useState } from "react";
import styled from "styled-components";
import { Skeleton } from "@telegram-apps/telegram-ui";

interface ImageWithSkeletonProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const shouldShowSkeleton = !loaded && !error && Boolean(src);

  return (
    <Wrapper>
      {src && (
        <Img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          $visible={loaded && !error}
          {...rest}
        />
      )}

      <SkeletonOverlay visible={shouldShowSkeleton} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;   /* КВАДРАТ 1:1 */
  overflow: hidden;
`;

const Img = styled.img<{ $visible: boolean }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s ease-in-out;
`;

const SkeletonOverlay = styled(Skeleton)`
  position: absolute !important;
  inset: 0;
  width: 100%;
  height: 100%;
`;
