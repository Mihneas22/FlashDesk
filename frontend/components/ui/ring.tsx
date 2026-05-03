import { useInView } from "@/hooks/use-in-view";
import { useState,useEffect } from "react";

export function Ring({ pct, size = 110, stroke = 9, color = "#8b5cf6" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const { ref, inView } = useInView();
  const [p, setP] = useState(0);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  useEffect(() => {
    if (!inView) return;
    let cur = 0;
    const t = setInterval(() => { cur = Math.min(cur + 1.5, pct); setP(cur); if (cur >= pct) clearInterval(t); }, 12);
    return () => clearInterval(t);
  }, [inView, pct]);
  return (
    <div ref={ref} style={{ width: size, height: size }} className="relative flex-shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={circ}
          strokeDashoffset={circ - (circ * p) / 100}
          style={{ transition: "stroke-dashoffset 0.05s linear" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-black text-white leading-none">{Math.round(p)}%</span>
      </div>
    </div>
  );
}