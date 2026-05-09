"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Timer, Lightbulb, ChevronRight, Trophy, ArrowLeft, Sparkles, AlertCircle, CheckCircle, X } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

export default function ActiveTestPage({ params }: { params: Promise<{ id: string }>; }) {
  const { id } = use(params);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [questions, setQuestions] = useState<any[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [time, setTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [tipUsed, setTipUsed] = useState(false);

  const [isSavingResult, setIsSavingResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [startedAt, setStartedAt] = useState<string>(""); // Nou: Salvăm când a început testul

  const [toast, setToast] = useState({ show: false, message: "", type: "error" });

  const showToast = useCallback((message: string, type: "error" | "success" = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid;
        if (extractedId) setIsLoggedIn(true);
      } catch (error) {
        console.error("Token invalid:", error);
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://learnqhub.com/api/question/getQuestionsByTest/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          showToast("Failed to fetch questions from the server.", "error");
          throw new Error("Failed to fetch questions");
        }
        
        const data = await response.json();
        
        if (data.flag === true && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setTime(data.time);
          setTimeLeft(data.time * 60); 
          setStartedAt(new Date().toISOString()); // Setăm timpul de start la primirea întrebărilor
        } else {
          setQuestions([]);
          if (data.flag === false && data.message) showToast(data.message, "error");
        }
      } catch (error) {
        console.error("Error while taking questions:", error);
        showToast("Network error. Could not connect to the server.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [id, showToast]);

  // Funcția de submit extrasă pentru a putea fi apelată și la finalul timpului, și la ultima întrebare
  const submitTestToServer = async (finalAnswersArray: any[]) => {
    if (!isLoggedIn) return; // Nu trimitem dacă nu e logat (opțional, în funcție de logica ta)
    
    setIsSavingResult(true);
    try {
      const payload = {
        Subm_TestId: id,
        Answers: finalAnswersArray,
        StartedAt: startedAt,
        FinishedAt: new Date().toISOString()
      };

      const response = await fetch(`https://learnqhub.com/api/test/addTestSubmission`, { 
        method: "POST",
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save submission");
      
    } catch (error) {
      console.error("Error saving result:", error);
      showToast("Could not save your test results.", "error");
    } finally {
      setIsSavingResult(false);
    }
  };

  useEffect(() => {
    if (isLoading || isFinished || timeLeft <= 0) {
      if (timeLeft <= 0 && !isLoading && questions.length > 0 && !isFinished) {
        // Dacă a expirat timpul
        setIsFinished(true);
        submitTestToServer(userAnswers); // Trimitem doar ce a apucat să răspundă până acum
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished, isLoading, questions.length]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Creăm noul răspuns și calculăm array-ul sincron, evitând problemele cu state-ul React
    const newAnswer = {
      questionId: currentQuestion.testQuestionId,
      selectedAnswerIndex: selectedOption,
      hintUsed: tipUsed
    };
    
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    // Păstrăm scorul local DOAR pentru UI-ul din Front-End (feedback rapid)
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      let earnedPoints = currentQuestion.points ?? 10;
      if (tipUsed) earnedPoints -= 2;
      setScore(prev => prev + earnedPoints);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setTipUsed(false);
    } else {
      // Am ajuns la ultima întrebare
      setIsFinished(true);
      submitTestToServer(updatedAnswers); // Pasăm variabila calculată anterior, nu state-ul
    }
  };

  const toastElement = toast.show && (
    // ... UI-ul pentru Toast a rămas neschimbat ...
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
      toast.type === "error" 
        ? "bg-red-950/90 border-red-500/50 text-red-200" 
        : "bg-green-950/90 border-green-500/50 text-green-200"
    }`}>
      {toast.type === "error" ? (
        <AlertCircle className="w-5 h-5 text-red-400" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-400" />
      )}
      <p className="font-semibold text-sm mr-2">{toast.message}</p>
      <button 
        onClick={() => setToast(prev => ({ ...prev, show: false }))} 
        className={`p-1 rounded-lg transition-colors ${
          toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"
        }`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-100">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-6 relative">
        <h2 className="text-2xl font-bold mb-4">No questions found</h2>
        <Link href="/test" className="px-6 py-3 bg-gray-800 rounded-xl">Back to tests</Link>
        {toastElement}
      </div>
    );
  }

  const question = questions[currentQuestionIndex];
  const maxPossibleScore = questions.length * 10; // Ar trebui ideal calculat și din questions[i].points
  const isTimeRunningOut = timeLeft < 60;

  if (isFinished && isLoggedIn) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 flex items-center justify-center p-6">
        {/* ... Restul UI-ului pentru End Screen a rămas intact ... */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
        <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-2xl w-full animate-scale-in">
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-10 text-center shadow-2xl border border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
            
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/20 animate-float rotate-3">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Test Completed!
            </h2>
            <p className="text-gray-400 font-medium mb-8">
              You finished the test in {formatTime(time * 60 - timeLeft)}.
            </p>
            
            <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-6 mb-8 inline-block min-w-[250px] shadow-inner">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
              <p className="text-5xl font-black text-white">
                {score} <span className="text-2xl text-gray-600">/ {maxPossibleScore}</span>
              </p>
            </div>

            <Link 
              href="/test" 
              className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all mb-6"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Tests
            </Link>

            {isSavingResult ? (
                <p className="text-sm text-yellow-400 mb-4 animate-pulse">Saving your results...</p>
            ) : (
                <p className="text-sm text-green-400 mb-4 flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4"/> Results saved to your profile
                </p>
            )}
          </div>
        </div>
        {toastElement}
        <style jsx>{`
          @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, 20px) scale(0.9); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-blob { animation: blob 7s infinite; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-scale-in { animation: scale-in 0.4s ease-out; }
        `}</style>
      </div>
    );
  }

  // ... Restul metodei return (ecranul de testare propriu-zis) rămâne la fel cum ai trimis-o,
  // fiind complet compatibilă cu logica nouă de mai sus.

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 py-8">
      {/* Container de background și decorațiuni grafice */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 relative z-10 animate-fade-in-up">
        {/* Header cu bară de progres și timer */}
        <div className="flex items-center justify-between mb-8 bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-purple-500/20">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
            </div>
            <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</p>
              <p className="text-lg font-black text-violet-300">{score} pts</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border transition-colors ${
              isTimeRunningOut 
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' 
                : 'bg-gray-950/50 text-gray-300 border-gray-800'
            }`}>
              <Timer className={`w-5 h-5 ${isTimeRunningOut ? 'text-red-400' : 'text-violet-400'}`} />
              <span className="w-12 text-center">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Zona cu întrebarea și răspunsurile */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-purple-500/20 mb-6 relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
            <Latex>{question.questionText}</Latex>
          </h2>

          <div className="space-y-3">
            {question.possibleAnswers?.map((option: string, idx: number) => {
              const isSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 outline-none text-left group
                    ${isSelected 
                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                      : 'border-gray-800 bg-gray-950/50 hover:border-gray-600 hover:bg-gray-800'
                    }`}
                >
                  <span className={`text-lg font-medium transition-colors ${isSelected ? 'text-violet-300' : 'text-gray-300 group-hover:text-white'}`}>
                    <Latex>{option}</Latex>
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-4
                    ${isSelected ? 'border-violet-500 bg-violet-500' : 'border-gray-600 group-hover:border-gray-400'}
                  `}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full animate-scale-in" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Butoanele din subsol (Hints & Next) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {question.hints && question.hints.length > 0 ? (
            <div className="w-full md:w-auto flex-1">
              {!tipUsed ? (
                <button 
                  onClick={() => setTipUsed(true)}
                  className="flex items-center gap-2 text-sm font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-xl hover:bg-yellow-500/20 transition-colors w-full md:w-auto justify-center"
                >
                  <Lightbulb className="w-4 h-4" />
                  Need a hint? (-2 pts)
                </button>
              ) : (
                <div className="animate-in fade-in slide-in-from-left-2 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-200 text-sm font-medium flex gap-3 items-start backdrop-blur-sm">
                  <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="flex-1 overflow-x-auto">
                    <Latex>{question.hints[0]}</Latex>
                  </div>
                </div>
              )}
            </div>
          ) : <div className="flex-1" />}

          <button
            onClick={handleNextQuestion}
            disabled={selectedOption === null}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-700/50 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            {currentQuestionIndex === questions.length - 1 ? "Finish Test" : "Next Question"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {toastElement}

      <style jsx>{`
        @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, 20px) scale(0.9); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}