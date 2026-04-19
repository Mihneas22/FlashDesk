"use client";

import Link from "next/link";
import { Timer, BrainCircuit, Play, HelpCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar"; 
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const TOPICS = [
  "Mathematical Analysis",
  "Physics",
  "C++ / Computer Programming",
  "Special Mathematics",
  "Numerical Methods",
  "Data Structures",
  "Discrete Mathematics",
  "Electrical Engineering",
  "Linear Algebra",
  "Basics of Computer Operation",
  "Object-oriented programming",
  "Assembly language programming",
  "Others"
];

export default function TestsListPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [tests, setTests] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid;

        if (extractedId) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Token invalid:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      setIsLoading(true);
      try {
        const encodedFilter = encodeURIComponent(filter);
        const response = await fetch(`http://localhost:5000/api/test/getTestsFilter/${encodedFilter}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch tests");
        }
        
        const data = await response.json();
        if (data.flag === true && Array.isArray(data.tests)) {
          setTests(data.tests);
        } else {
          setTests([]);
        }
      } catch (error) {
        console.error("Error while taking tests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTests();
  }, [filter]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50 animate-float">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Available Tests
            </h1>
          </div>
          <p className="text-lg text-gray-400 ml-16">
            Test your knowledge and track your progress.
          </p>
        </div>

        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                filter === "all"
                  ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-900/40"
                  : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800"
              }`}
            >
              All Topics
            </button>
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setFilter(topic)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === topic
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-900/40"
                    : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
            <p className="text-gray-400 font-medium">Loading tests...</p>
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in bg-gray-900/30 rounded-3xl border border-gray-800/50">
            <BrainCircuit className="w-16 h-16 text-gray-600 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No tests found</h3>
            <p className="text-gray-500">There are currently no tests available for this topic.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {tests != null && tests.map((test, index) => (
              <div 
                key={test.testId} 
                className="group relative flex flex-col h-full outline-none animate-slide-up"
                style={{ animationDelay: `${index * 75}ms` }}
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-[2rem] opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500" />
                
                <div className="relative flex flex-col h-full bg-gray-900/60 backdrop-blur-md rounded-3xl border border-purple-500/20 shadow-lg group-hover:shadow-purple-900/20 transition-all duration-500 group-hover:-translate-y-1.5 overflow-hidden group-hover:border-purple-500/40">
                  <div className="p-6 flex flex-col flex-1">
                    <div className="w-12 h-12 mb-5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-[2px] shadow-lg shadow-purple-900/50">
                      <div className="w-full h-full rounded-[14px] bg-gray-900/50 backdrop-blur-md flex items-center justify-center">
                        <BrainCircuit className="w-6 h-6 text-purple-300 drop-shadow-sm" />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-400 transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-400 line-clamp-2 mb-6 flex-1">
                      {test.description}
                    </p>
                    <h3 className="text-xl font-medium text-white mb-2 group-hover:text-violet-400 transition-colors">
                      {test.topic}
                    </h3>

                    <div className="flex items-center gap-4 text-sm font-bold text-gray-300">
                      <div className="flex items-center gap-1.5 bg-gray-950/50 px-3 py-1.5 rounded-xl border border-gray-800">
                        <Timer className="w-4 h-4 text-violet-400" />
                        <span>{test.time || 0} min</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-950/30 border-t border-purple-500/10 mt-auto">
                    <Link 
                      href={`/test/${test.testId}`} 
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-purple-900/40 hover:shadow-xl hover:shadow-purple-700/50 transition-all active:scale-[0.98] group/btn"
                    >
                      <Play className="w-4 h-4 fill-white group-hover/btn:scale-110 transition-transform" />
                      Start Test
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 50px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out backwards; }
      `}</style>
    </div>
  );
}