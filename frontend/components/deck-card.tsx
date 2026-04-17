import { BookOpen, MoreVertical, Eye, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Deck } from "@/lib/store";

interface DeckCardProps {
  deck: Deck;
}

// Color schemes for different topics
const topicColors: Record<string, { gradient: string; icon: string; shadow: string }> = {
  "Mathematical Analysis": { 
    gradient: "from-blue-500 to-cyan-500", 
    icon: "bg-blue-400",
    shadow: "shadow-blue-500/30"
  },
  "Physics": { 
    gradient: "from-purple-500 to-pink-500", 
    icon: "bg-purple-400",
    shadow: "shadow-purple-500/30"
  },
  "C++ / Computer Programming": { 
    gradient: "from-green-500 to-emerald-500", 
    icon: "bg-green-400",
    shadow: "shadow-green-500/30"
  },
  "Special Mathematics": { 
    gradient: "from-orange-500 to-red-500", 
    icon: "bg-orange-400",
    shadow: "shadow-orange-500/30"
  },
  "Numerical Methods": { 
    gradient: "from-indigo-500 to-purple-500", 
    icon: "bg-indigo-400",
    shadow: "shadow-indigo-500/30"
  },
  "Data Structures": { 
    gradient: "from-teal-500 to-cyan-500", 
    icon: "bg-teal-400",
    shadow: "shadow-teal-500/30"
  },
  "Discrete Mathematics": { 
    gradient: "from-pink-500 to-rose-500", 
    icon: "bg-pink-400",
    shadow: "shadow-pink-500/30"
  },
  "Electrical Engineering": { 
    gradient: "from-yellow-500 to-orange-500", 
    icon: "bg-yellow-400",
    shadow: "shadow-yellow-500/30"
  },
  "Linear Algebra": { 
    gradient: "from-violet-500 to-purple-500", 
    icon: "bg-violet-400",
    shadow: "shadow-violet-500/30"
  },
  "Basics of Computer Operation": { 
    gradient: "from-sky-500 to-blue-500", 
    icon: "bg-sky-400",
    shadow: "shadow-sky-500/30"
  },
  "Object-oriented programming": { 
    gradient: "from-emerald-500 to-teal-500", 
    icon: "bg-emerald-400",
    shadow: "shadow-emerald-500/30"
  },
  "Assembly language programming": { 
    gradient: "from-slate-600 to-gray-700", 
    icon: "bg-slate-500",
    shadow: "shadow-slate-500/30"
  }
};

const defaultColors = { 
  gradient: "from-violet-500 to-purple-500", 
  icon: "bg-violet-400",
  shadow: "shadow-violet-500/30"
};

export function DeckCard({ deck }: DeckCardProps) {
  const colors = deck.topic ? (topicColors[deck.topic] || defaultColors) : defaultColors;
  const cardCount = deck.cards?.length || 0;

  return (
    <Link href={`/deck/${deck.id}`}>
      <div className="group relative h-full">
        {/* Glow effect on hover */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${colors.gradient} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300`} />
        
        {/* Main card */}
        <div className="relative h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group-hover:-translate-y-1">
          {/* Gradient header */}
          <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />
          
          {/* Card content */}
          <div className="p-6">
            {/* Header with icon and menu */}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.gradient} ${colors.shadow} flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Title and description */}
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1.5 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-violet-600 group-hover:to-purple-600 transition-all line-clamp-2">
                {deck.title}
              </h3>
              {deck.description && (
                <p className="text-sm text-gray-500 line-clamp-2">
                  {deck.description}
                </p>
              )}
            </div>

            {/* Topic badge */}
            {deck.topic && (
              <div className="mb-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${colors.gradient} text-white shadow-sm`}>
                  <Sparkles className="w-3 h-3" />
                  {deck.topic}
                </span>
              </div>
            )}

            {/* Footer with stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${colors.icon} bg-opacity-20 flex items-center justify-center`}>
                  <span className="text-sm font-bold text-gray-700">{cardCount}</span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {cardCount === 1 ? "card" : "cards"}
                </span>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-1.5">
                {deck.status === false ? (
                  <>
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      Private
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
                      Public
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Decorative corner element */}
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} transform rotate-45 translate-x-12 -translate-y-12 rounded-lg`} />
          </div>
        </div>
      </div>
    </Link>
  );
}
