"use client";

import { use, useState, useEffect } from "react";
import { Timer, Lightbulb, ChevronRight, CheckCircle2, XCircle, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TestData, mockTests } from "@/lib/test-store"; // Adaptează calea

export default function ActiveTestPage({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = use(params);
  const test = mockTests.find(t => t.id === id)!;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [isFinished, setIsFinished] = useState(false);
  const [tipUsed, setTipUsed] = useState(false);

  const question = test.questions[currentQuestionIndex];
  const maxPossibleScore = test.questions.reduce((acc, q) => acc + q.points, 0);

  // Timer logic
  useEffect(() => {
    if (isFinished || timeLeft <= 0) {
      if (timeLeft <= 0) setIsFinished(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNextQuestion = () => {
    // Calculăm scorul pentru întrebarea curentă
    if (selectedOption === question.correctAnswerIndex) {
      let earnedPoints = question.points;
      if (tipUsed) earnedPoints -= question.tipPenalty;
      setScore(prev => prev + earnedPoints);
    }

    // Trecem mai departe sau terminăm
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTipUsed(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-3xl p-10 text-center shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-gray-100">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-yellow-500/30">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">Test Completed!</h2>
          <p className="text-gray-500 font-medium mb-8">You finished the test in {formatTime(test.durationMinutes * 60 - timeLeft)}.</p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 inline-block min-w-[250px]">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
            <p className="text-5xl font-black text-indigo-600">
              {score} <span className="text-2xl text-gray-400">/ {maxPossibleScore}</span>
            </p>
          </div>

          <Link href="/tests" className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const isTimeRunningOut = timeLeft < 60; // Mai puțin de 1 minut

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      {/* Header: Progress, Timer, Score */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </p>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500"
              style={{ width: `${((currentQuestionIndex) / test.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 ml-8">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Score</p>
            <p className="text-lg font-black text-gray-900">{score} pts</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${isTimeRunningOut ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-gray-50 text-gray-700'}`}>
            <Timer className="w-5 h-5" />
            <span className="w-12 text-center">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.05)] border border-gray-100 mb-6 relative overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
          {question.text}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 outline-none text-left
                  ${isSelected 
                    ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-500/10' 
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                  }`}
              >
                <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>
                  {option}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'}
                `}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer: Tips & Next Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {question.tip ? (
          <div className="w-full md:w-auto flex-1">
            {!tipUsed ? (
              <button 
                onClick={() => setTipUsed(true)}
                className="flex items-center gap-2 text-sm font-bold text-amber-600 bg-amber-50 px-4 py-3 rounded-xl hover:bg-amber-100 transition-colors w-full md:w-auto justify-center"
              >
                <Lightbulb className="w-4 h-4" />
                Need a hint? (-{question.tipPenalty} pts)
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-left-2 p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium flex gap-3 items-start">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p>{question.tip}</p>
              </div>
            )}
          </div>
        ) : <div className="flex-1" />}

        <button
          onClick={handleNextQuestion}
          disabled={selectedOption === null}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
        >
          {currentQuestionIndex === test.questions.length - 1 ? "Finish Test" : "Next Question"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}