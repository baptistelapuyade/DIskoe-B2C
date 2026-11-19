import type { Crop } from "@/lib/domain/profile-publication";

// A square window onto an image. `crop` is the visible part as fractions of the
// image (x, y = left and top edge; w, h = size). Because the crop is square in
// pixels, w * width = h * height, so stretching the image to 1/w and 1/h of the
// box keeps its proportions. Without a crop the image fills the box (cover).
export function CroppedSquare({
  url,
  alt = "",
  crop,
  size,
  className = "",
}: {
  url: string;
  alt?: string;
  crop: Crop | null;
  // Pixel size, or undefined to fill the width of the parent.
  size?: number;
  className?: string;
}) {
  const style = size ? { width: size, height: size } : { width: "100%" };

  return (
    <span
      className={`relative block aspect-square overflow-hidden ${className}`}
      style={style}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={alt}
        draggable={false}
        className={crop ? "absolute max-w-none" : "size-full object-cover"}
        style={
          crop
            ? {
                width: `${100 / crop.w}%`,
                height: `${100 / crop.h}%`,
                left: `${(-crop.x / crop.w) * 100}%`,
                top: `${(-crop.y / crop.h) * 100}%`,
              }
            : undefined
        }
      />
    </span>
  );
}
