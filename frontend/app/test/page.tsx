"use client";

import Link from "next/link";
import { Timer, BrainCircuit, Play, HelpCircle } from "lucide-react";
import { TestData, mockTests } from "@/lib/test-store"; // Adaptează calea

export default function TestsListPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Tests</h1>
        <p className="text-gray-500 font-medium">Test your knowledge and track your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTests.map((test) => (
          <div key={test.id} className="group relative flex flex-col h-full outline-none">
            {/* Efect de Glow pe hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-[2rem] opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500" />
            
            <div className="relative flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-3xl border border-indigo-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group-hover:shadow-[0_20px_40px_rgb(99,102,241,0.1)] transition-all duration-500 group-hover:-translate-y-1.5 overflow-hidden">
              <div className="p-6 flex flex-col flex-1">
                <div className="w-12 h-12 mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 p-[2px] shadow-lg shadow-blue-500/30">
                  <div className="w-full h-full rounded-[14px] bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {test.title}
                </h3>
                <p className="text-sm font-medium text-gray-500 line-clamp-2 mb-6 flex-1">
                  {test.description}
                </p>

                <div className="flex items-center gap-4 text-sm font-bold text-gray-600">
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Timer className="w-4 h-4 text-indigo-500" />
                    <span>{test.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <HelpCircle className="w-4 h-4 text-rose-500" />
                    <span>{test.questions.length} Qs</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-indigo-50/50 mt-auto">
                <Link href={`/tests/${test.id}`} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-indigo-500/25 transition-all active:scale-[0.98]">
                  <Play className="w-4 h-4 fill-white" />
                  Start Test
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}