import React, { useEffect, useRef } from "react";

type Props = {
  src: string;      // sprite sheet URL
  frameW: number;   // frame width, e.g. 32
  frameH: number;   // frame height, e.g. 32
  fps?: number;     // frames per second, default 6
};

export const Sprite: React.FC<Props> = ({
  src,
  frameW,
  frameH,
  fps = 6,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const el = ref.current!;
    const id = setInterval(() => {
      frame = (frame + 1) % 4; // 4-frame sheet
      el.style.backgroundPosition = `-${frame * frameW}px 0`;
    }, 1000 / fps);
    return () => clearInterval(id);
  }, [frameW, fps]);

  return (
    <div
      ref={ref}
      style={{
        width: frameW,
        height: frameH,
        backgroundImage: `url(${src})`,
        imageRendering: "pixelated",
      }}
    />
  );
};
