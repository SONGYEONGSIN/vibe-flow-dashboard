"use client";

import { useEffect, useState } from "react";

type Props = {
  text: string;
  expiresAt: number;
};

export function SpeechBubble({ text, expiresAt }: Props) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setVisible(true);
    setFading(false);
    const remain = expiresAt - Date.now();
    const fadeStart = Math.max(0, remain - 400);
    const t1 = setTimeout(() => setFading(true), fadeStart);
    return () => clearTimeout(t1);
  }, [text, expiresAt]);

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-1.5 whitespace-nowrap rounded-md bg-white px-2 py-1 text-[11px] font-semibold text-zinc-900 shadow-md transition-opacity duration-200"
      style={{ opacity: visible && !fading ? 1 : 0 }}
    >
      {text}
      <span
        aria-hidden
        className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-white"
      />
    </div>
  );
}
