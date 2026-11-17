"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import type { Crop } from "@/lib/domain/profile-publication";
import { t, type Lang } from "@/lib/i18n";

// Crop screen of the profile picture (ORG-05e, 05g): the whole picture with a
// square frame. The frame is dragged with the pointer or the arrow keys and
// zoomed with the slider or + and −. The result is a Crop in fractions of the
// picture (see migration 20261117130000); the picture file is never changed.
const MIN_SIDE_PX = 200; // smallest visible part, in pixels of the original
const KEY_STEP = 0.02; // of the short side
const ZOOM_STEP = 0.1;

type Frame = { left: number; top: number; side: number };

function clampFrame(frame: Frame, nw: number, nh: number): Frame {
  const side = Math.min(frame.side, nw, nh);

  return {
    side,
    left: Math.min(Math.max(frame.left, 0), nw - side),
    top: Math.min(Math.max(frame.top, 0), nh - side),
  };
}

export function CropEditor({
  lang,
  url,
  initial,
  failed,
  busy,
  onApply,
  onOther,
}: {
  lang: Lang;
  url: string;
  initial: Crop | null;
  // The last save failed (ORG-05g): the main button says "Try again".
  failed: boolean;
  busy: boolean;
  onApply: (crop: Crop) => void;
  onOther: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const drag = useRef<{ x: number; y: number; left: number; top: number } | null>(null);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;

    const observer = new ResizeObserver(() => setStage(node.clientWidth));
    observer.observe(node);
    setStage(node.clientWidth);

    return () => observer.disconnect();
  }, []);

  const onLoad = useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const nw = event.currentTarget.naturalWidth;
      const nh = event.currentTarget.naturalHeight;
      const short = Math.min(nw, nh);

      setNatural({ w: nw, h: nh });
      setFrame(
        initial
          ? clampFrame(
              { left: initial.x * nw, top: initial.y * nh, side: initial.w * nw },
              nw,
              nh,
            )
          : { left: (nw - short) / 2, top: (nh - short) / 2, side: short },
      );
    },
    [initial],
  );

  const scale = natural && stage ? Math.min(stage / natural.w, stage / natural.h) : 0;
  const offX = natural ? (stage - natural.w * scale) / 2 : 0;
  const offY = natural ? (stage - natural.h * scale) / 2 : 0;
  const short = natural ? Math.min(natural.w, natural.h) : 0;
  const minSide = Math.min(short, MIN_SIDE_PX);
  const zoom = frame && short > minSide ? (short - frame.side) / (short - minSide) : 0;

  function setZoom(next: number) {
    if (!natural || !frame) return;

    const z = Math.min(1, Math.max(0, next));
    const side = short - z * (short - minSide);
    const centreX = frame.left + frame.side / 2;
    const centreY = frame.top + frame.side / 2;

    setFrame(
      clampFrame({ side, left: centreX - side / 2, top: centreY - side / 2 }, natural.w, natural.h),
    );
  }

  function move(dx: number, dy: number) {
    if (!natural || !frame) return;
    setFrame(clampFrame({ ...frame, left: frame.left + dx, top: frame.top + dy }, natural.w, natural.h));
  }

  function apply() {
    if (!natural || !frame) return;

    onApply({
      x: frame.left / natural.w,
      y: frame.top / natural.h,
      w: frame.side / natural.w,
      h: frame.side / natural.h,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {failed ? (
        <Notice tone="error" title={t(lang, "Z23.save.failed.title")}>
          {t(lang, "Z23.save.failed.keep")}
        </Notice>
      ) : null}

      <div className="flex flex-col gap-4">
        <div
          ref={stageRef}
          className="bg-foreground/90 relative aspect-square w-full max-w-[360px] touch-none overflow-hidden rounded-lg select-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt=""
            draggable={false}
            onLoad={onLoad}
            className="absolute max-w-none"
            style={
              natural
                ? { left: offX, top: offY, width: natural.w * scale, height: natural.h * scale }
                : { opacity: 0 }
            }
          />
          {natural && frame ? (
            <div
              role="group"
              tabIndex={0}
              aria-label={t(lang, "Z23.crop.area")}
              className="focus-visible:outline-ring absolute cursor-grab border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 active:cursor-grabbing"
              style={{
                left: offX + frame.left * scale,
                top: offY + frame.top * scale,
                width: frame.side * scale,
                height: frame.side * scale,
              }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX, y: event.clientY, left: frame.left, top: frame.top };
              }}
              onPointerMove={(event) => {
                const start = drag.current;
                if (!start || !scale) return;
                setFrame(
                  clampFrame(
                    {
                      side: frame.side,
                      left: start.left + (event.clientX - start.x) / scale,
                      top: start.top + (event.clientY - start.y) / scale,
                    },
                    natural.w,
                    natural.h,
                  ),
                );
              }}
              onPointerUp={() => {
                drag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
              }}
              onKeyDown={(event) => {
                const step = short * KEY_STEP * (event.shiftKey ? 5 : 1);
                const keys: Record<string, () => void> = {
                  ArrowLeft: () => move(-step, 0),
                  ArrowRight: () => move(step, 0),
                  ArrowUp: () => move(0, -step),
                  ArrowDown: () => move(0, step),
                  "+": () => setZoom(zoom + ZOOM_STEP),
                  "=": () => setZoom(zoom + ZOOM_STEP),
                  "-": () => setZoom(zoom - ZOOM_STEP),
                };
                const handler = keys[event.key];

                if (handler) {
                  event.preventDefault();
                  handler();
                }
              }}
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className="border border-white/40" />
                ))}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex w-full max-w-[360px] items-center gap-3">
          <Button
            variant="secondary"
            aria-label={t(lang, "Z23.crop.zoomOut")}
            style={{ width: 44, paddingLeft: 0, paddingRight: 0 }}
            onClick={() => setZoom(zoom - ZOOM_STEP)}
          >
            −
          </Button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(zoom * 100)}
            aria-label={t(lang, "Z23.crop.area")}
            onChange={(event) => setZoom(Number(event.target.value) / 100)}
            className="accent-brand-iris h-11 min-w-0 flex-1"
          />
          <Button
            variant="secondary"
            aria-label={t(lang, "Z23.crop.zoomIn")}
            style={{ width: 44, paddingLeft: 0, paddingRight: 0 }}
            onClick={() => setZoom(zoom + ZOOM_STEP)}
          >
            +
          </Button>
        </div>

        <p className="text-muted-foreground text-sm leading-5">{t(lang, "Z23.crop.hint")}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primaryLg" onClick={apply} disabled={busy || !frame} aria-busy={busy}>
          {failed ? t(lang, "Z23.crop.retry") : t(lang, "Z23.crop.apply")}
        </Button>
        <Button variant="ghostLg" onClick={onOther} disabled={busy}>
          {t(lang, "Z23.crop.other")}
        </Button>
      </div>
    </div>
  );
}
