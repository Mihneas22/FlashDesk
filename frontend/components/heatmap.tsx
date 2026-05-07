"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Grid, Flame } from "lucide-react";

interface DailyHeatmapData {
  date: string;        // "yyyy-MM-dd"
  cardsStudied: number;
}

interface HeatmapCell {
  date: string;        // "yyyy-MM-dd" — pentru tooltip
  label: string;       // "15 Jan" — human-readable
  cardsStudied: number;
  level: number;       // 0-4 pentru culoare
  isToday: boolean;
}

interface StudyHeatmapProps {
  userId?: string;
  currentStreak?: number;
}

const HEAT_STYLES = [
  { 
    bg: "bg-[#120e28]", 
    border: "border-gray-800/30", 
    label: "0 cards" 
  },
  { 
    bg: "bg-[#120d29]", 
    border: "border-[#25154c]/30", 
    label: "1-9 cards" 
  },
  { 
    bg: "bg-[#25154c]", 
    border: "border-[#3e2078]/40", 
    label: "10-24" 
  },
  { 
    bg: "bg-[#3e2078]", 
    border: "border-[#3e2078]/70", 
    label: "25-49" 
  },
  { 
    bg: "bg-[#24988e] shadow-sm shadow-[#24988e]/40", 
    border: "border-[#24988e]/80", 
    label: "50+" 
  },
];

function getLevel(cards: number): number {
  if (cards === 0) return 0;
  if (cards < 10)  return 1;
  if (cards < 25)  return 2;
  if (cards < 50)  return 3;
  return 4;
}

function buildMatrix(apiData: DailyHeatmapData[]): {
  weeks: HeatmapCell[][];
  monthLabels: { weekIndex: number; label: string }[];
} {
  const statsMap = new Map<string, number>();
  apiData.forEach(stat => statsMap.set(stat.date, stat.cardsStudied));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: HeatmapCell[] = [];
  for (let i = 104; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day   = String(d.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;

    const cardsStudied = statsMap.get(dateKey) ?? 0;
    const isToday = i === 0;

    cells.push({
      date: dateKey,
      label: d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" }),
      cardsStudied,
      level: getLevel(cardsStudied),
      isToday,
    });
  }

  const weeks: HeatmapCell[][] = [];
  for (let w = 0; w < 15; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }

  const monthLabels: { weekIndex: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, w) => {
    const firstDayOfWeek = new Date(week[0].date);
    const m = firstDayOfWeek.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        weekIndex: w,
        label: firstDayOfWeek.toLocaleDateString("en-US", { month: "short" }),
      });
      lastMonth = m;
    }
  });

  return { weeks, monthLabels };
}

function CellTooltip({ cell, visible }: { cell: HeatmapCell; visible: boolean }) {
  return (
    <div
      className={`
        absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2
        px-2.5 py-1.5 rounded-lg
        bg-gray-900 border border-gray-700/80
        text-[11px] font-semibold text-white
        whitespace-nowrap pointer-events-none
        shadow-xl shadow-black/40
        transition-all duration-150
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
      `}
    >
      <div className="text-gray-300">{cell.label}</div>
      <div className={`font-black ${cell.cardsStudied > 0 ? "text-violet-300" : "text-gray-500"}`}>
        {cell.cardsStudied === 0 ? "No cards reviewed" : `${cell.cardsStudied} cards reviewed`}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700/80" />
    </div>
  );
}

function HeatCell({ cell, animDelay, animated }: {
  cell: HeatmapCell;
  animDelay: number;
  animated: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const style = HEAT_STYLES[cell.level];

  return (
    <div
      className="relative w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`
          w-full aspect-square rounded-sm border cursor-default
          transition-all duration-500 ease-out
          hover:scale-125 hover:z-10
          ${style.bg} ${style.border}
          ${cell.isToday ? "ring-1 ring-violet-300/70 ring-offset-1 ring-offset-gray-900" : ""}
          ${animated ? "opacity-100" : "opacity-0"}
        `}
        style={{ transitionDelay: animated ? `${animDelay}ms` : "0ms" }}
      />
      <CellTooltip cell={cell} visible={hovered} />
    </div>
  );
}

export function StudyHeatmap({ userId, currentStreak = 0 }: StudyHeatmapProps) {
  const [weeks, setWeeks] = useState<HeatmapCell[][]>(() =>
    Array.from({ length: 15 }, (_, w) => {
      const week: HeatmapCell[] = [];
      for (let d = 0; d < 7; d++) {
        const daysAgo = (14 - w) * 7 + (6 - d);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        const dateKey = date.toISOString().split("T")[0];
        week.push({ date: dateKey, label: "", cardsStudied: 0, level: 0, isToday: daysAgo === 0 });
      }
      return week;
    })
  );
  const [monthLabels, setMonthLabels] = useState<{ weekIndex: number; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setAnimated(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchHeatmap = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`https://learnqhub.com/api/user/heatmap`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      if (json.flag && Array.isArray(json.data)) {
        const { weeks: built, monthLabels: labels } = buildMatrix(json.data as DailyHeatmapData[]);
        setWeeks(built);
        setMonthLabels(labels);
      }
    } catch (err) {
      console.error("Heatmap fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const totalCardsLast15Weeks = weeks.flat().reduce((s, c) => s + c.cardsStudied, 0);
  const activeDays = weeks.flat().filter(c => c.cardsStudied > 0).length;
  const bestDay = weeks.flat().reduce((best, c) => c.cardsStudied > best.cardsStudied ? c : best, weeks[0]?.[0] ?? { cardsStudied: 0, label: "" });

  return (
    <div
      ref={containerRef}
      className="rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-md p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/40">
            <Grid className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Study Heatmap</h2>
            <p className="text-[11px] text-gray-500">Last 15 weeks of activity</p>
          </div>
        </div>

        {/* Legenda */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-gray-600 font-semibold">Less</span>
          {HEAT_STYLES.map((s, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm border ${s.bg} ${s.border}`}
              title={s.label}
            />
          ))}
          <span className="text-[10px] text-gray-600 font-semibold">More</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          <div className="flex gap-1 mb-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex-1 h-3 rounded bg-gray-800/50 animate-pulse" />
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, row) => (
            <div key={row} className="flex gap-1">
              {Array.from({ length: 15 }).map((_, col) => (
                <div
                  key={col}
                  className="flex-1 aspect-square rounded-sm bg-gray-800/40 animate-pulse"
                  style={{ animationDelay: `${(row * 15 + col) * 20}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <>

          <div className="flex gap-1 mb-1.5 h-4">
            {weeks.map((_, w) => {
              const label = monthLabels.find(m => m.weekIndex === w);
              return (
                <div key={w} className="flex-1 text-[9px] text-gray-500 font-bold text-center truncate">
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1">
            {weeks.map((week, w) => (
              <div key={w} className="flex flex-col gap-1 flex-1">
                {week.map((cell, d) => (
                  <HeatCell
                    key={cell.date}
                    cell={cell}
                    animDelay={(w * 7 + d) * 6}
                    animated={animated}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
              <div className="text-base font-black text-white">{totalCardsLast15Weeks.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5">Cards in 15w</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
              <div className="text-base font-black text-white">{activeDays}<span className="text-gray-500 font-normal text-sm">/105</span></div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5">Active days</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-800/30 border border-gray-700/30 text-center">
              <div className="text-base font-black text-white">{bestDay.cardsStudied}</div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide mt-0.5">Best day</div>
            </div>
          </div>

          {/* Streak banner */}
          <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
            currentStreak > 0
              ? "bg-orange-500/10 border-orange-500/20"
              : "bg-gray-800/30 border-gray-700/30"
          }`}>
            <Flame className={`w-4 h-4 flex-shrink-0 ${currentStreak > 0 ? "text-orange-400 animate-pulse" : "text-gray-600"}`} />
            {currentStreak > 0 ? (
              <span className="text-sm text-orange-300 font-semibold">
                You are on a streak of{" "}
                <strong className="text-orange-400">{currentStreak} {currentStreak === 1 ? "day" : "days"}</strong>
                {" "}— keep it up!
              </span>
            ) : (
              <span className="text-sm text-gray-500 font-semibold">
                Study today to start a streak!
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default StudyHeatmap;