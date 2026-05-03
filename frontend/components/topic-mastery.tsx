import { ChevronRight, Brain } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { Ring } from "./ui/ring";
import { MappedTopic } from "@/lib/store";

export function TopicMastery({ topics }: { topics: MappedTopic[] }) {
  const { ref, inView } = useInView();

  if (!topics || topics.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-purple-500/20 bg-gray-900/40 backdrop-blur-md p-6 transition-all duration-700 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-pink-900/40">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black text-white">Topic Mastery</h2>
            <p className="text-[11px] text-gray-500">Breakdown by course</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-violet-400 transition-colors font-semibold">
          See all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      {/* Folosim prop-ul `topics` aici în loc de constanta globală */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t, i) => (
          <div
            key={t.name}
            className="group p-4 rounded-2xl bg-gray-800/30 border border-gray-700/30 hover:border-purple-500/30 hover:-translate-y-1 transition-all duration-300 cursor-default"
            style={{ opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(16px)", transitionDelay: `${i * 80}ms`, transition: "all 0.5s ease" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-2">
                <div className="text-sm font-bold text-white truncate">{t.name}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{t.mastered}/{t.cards} mastered</div>
              </div>
              <Ring pct={t.pct} size={52} stroke={5} color={t.ringColor} />
            </div>
            <div className="h-1.5 rounded-full bg-gray-700/50 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${t.color} transition-all duration-1000`}
                style={{ width: inView ? `${t.pct}%` : "0%", transitionDelay: `${i * 80 + 300}ms` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className={`text-[10px] font-bold ${t.pct >= 75 ? "text-emerald-400" : t.pct >= 50 ? "text-amber-400" : "text-red-400"}`}>
                {t.pct >= 75 ? "Strong ✓" : t.pct >= 50 ? "Developing" : "Needs work"}
              </span>
              <span className="text-[10px] text-gray-500 font-semibold">{t.pct}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}