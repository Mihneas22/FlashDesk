"use client";

import { use, useState, useEffect, useCallback } from "react";
import { Timer, Lightbulb, ChevronRight, Trophy, ArrowLeft, Lock, AlertCircle, CheckCircle, X, Info, Crown } from "lucide-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

import 'katex/dist/katex.min.css';
import Latex from 'react-latex-next';

const MatrixRenderer = ({ config }: { config: any }) => {
  if (!config || !Array.isArray(config)) return null;
  
  try {
    const latexRows = config.map(row => 
      Array.isArray(row) ? row.join(" & ") : row
    ).join(" \\\\ ");
    
    const latexString = `$$ \\begin{bmatrix} ${latexRows} \\end{bmatrix} $$`;
    
    return (
      <div className="my-4 p-4 bg-gray-950/50 rounded-xl border border-gray-800 flex justify-center overflow-x-auto">
        <Latex>{latexString}</Latex>
      </div>
    );
  } catch (err) {
    console.error("Failed to render matrix:", err);
    return null;
  }
};

const GraphRenderer = ({ config }: { config: any }) => {
  if (!config) return null;
  return (
    <div className="my-4 p-6 bg-gray-950/50 rounded-xl border border-gray-800 flex items-center justify-center flex-col gap-2">
      <p className="text-sm text-gray-500 font-medium">Interactive Graph Area</p>
      <div className="w-full h-48 bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800/50 border-dashed">
         {/* AICI vei inițializa chart-ul (ex: function-plot, recharts). */}
         <span className="text-gray-600 text-xs text-center px-4">
           Data from viewConfig: <br/> 
           <code className="text-violet-400">{JSON.stringify(config)}</code>
         </span>
      </div>
    </div>
  );
};

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
  const [isShowingExplanation, setIsShowingExplanation] = useState(false);

  const [isSavingResult, setIsSavingResult] = useState(false);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [startedAt, setStartedAt] = useState<string>("");
  
  const [isPro, setIsPro] = useState<boolean | null>(null); 
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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
        const extractedId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
        
        const subscriptionPlan = decoded["SubscriptionPlan"];
        
        const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
        const isUserAdmin = Array.isArray(roles) ? roles.includes("admin") : roles === "admin";
        
        if (extractedId) {
          setIsLoggedIn(true);
          
          if (subscriptionPlan === "Pro" || isUserAdmin) {
            setIsPro(true);
          } else {
            setIsPro(false);
          }
        } else {
          setIsLoggedIn(false);
          setIsPro(false);
        }
      } catch (error) {
        console.error("Eroare la decodarea token-ului:", error);
        setIsLoggedIn(false);
        setIsPro(false);
      }
    } else {
      setIsLoggedIn(false);
      setIsPro(false);
    }
    setIsAuthChecking(false);
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
        
        if (!response.ok) throw new Error("Failed to fetch questions");
        
        const data = await response.json();
        
        if (data.flag === true && Array.isArray(data.questions)) {
          setQuestions(data.questions);
          setTime(data.time);
          setTimeLeft(data.time * 60); 
          setStartedAt(new Date().toISOString()); 
        } else {
          setQuestions([]);
          if (data.flag === false && data.message) showToast(data.message, "error");
        }
      } catch (error) {
        showToast("Network error. Could not connect to the server.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [id, showToast]);

  const submitTestToServer = async (finalAnswersArray: any[]) => {
    if (!isLoggedIn) return; 
    
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
      showToast("Could not save your test results.", "error");
    } finally {
      setIsSavingResult(false);
    }
  };

  useEffect(() => {
    if (isLoading || isFinished || timeLeft <= 0) {
      if (timeLeft <= 0 && !isLoading && questions.length > 0 && !isFinished) {
        setIsFinished(true);
        submitTestToServer(userAnswers); 
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

  const handleActionClick = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Dacă explicația este deja vizibilă (adică userul a greșit la pasul anterior), acum doar trecem mai departe.
    if (isShowingExplanation) {
      proceedToNext(userAnswers);
      return;
    }

    // Înregistrăm răspunsul în listă
    const newAnswer = {
      questionId: currentQuestion.testQuestionId,
      selectedAnswerIndex: selectedOption,
      hintUsed: tipUsed
    };
    
    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);

    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      let earnedPoints = currentQuestion.points ?? 10;
      if (tipUsed) earnedPoints -= 2;
      setScore(prev => prev + earnedPoints);
      
      // Dacă e corect, trecem direct la următoarea
      proceedToNext(updatedAnswers);
    } else {
      // Dacă e greșit, arătăm explicația și rămânem pe ecran
      setIsShowingExplanation(true);
    }
  };

  const proceedToNext = (finalAnswers: any[]) => {
    setIsShowingExplanation(false);
    setSelectedOption(null);
    setTipUsed(false);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      submitTestToServer(finalAnswers); 
    }
  };

  const toastElement = toast.show && (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-fade-in-up transition-all ${
      toast.type === "error" 
        ? "bg-red-950/90 border-red-500/50 text-red-200" 
        : "bg-green-950/90 border-green-500/50 text-green-200"
    }`}>
      {toast.type === "error" ? <AlertCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-green-400" />}
      <p className="font-semibold text-sm mr-2">{toast.message}</p>
      <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className={`p-1 rounded-lg transition-colors ${toast.type === "error" ? "hover:bg-red-900/50" : "hover:bg-green-900/50"}`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (questions.length === 0) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-gray-100 p-6"><h2 className="text-2xl font-bold mb-4">No questions found</h2><Link href="/test" className="px-6 py-3 bg-gray-800 rounded-xl">Back to tests</Link>{toastElement}</div>;

  const question = questions[currentQuestionIndex];
  const isTimeRunningOut = timeLeft < 60;

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-950"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // --- NOU: ECRANUL PENTRU PAYWALL / UPGRADE TO PRO ---
  if (isPro === false) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 flex items-center justify-center p-6">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/10 to-gray-900" />
        <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-600/30 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        </div>

        <div className="max-w-md w-full animate-scale-in">
          <div className="bg-gray-900/80 backdrop-blur-md rounded-3xl p-8 md:p-10 text-center shadow-2xl border border-gray-800 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 opacity-80" />
            
            <div className="w-20 h-20 mx-auto bg-gray-950 border border-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/50 relative">
              <Lock className="w-8 h-8 text-gray-500 absolute" />
              <Crown className="w-10 h-10 text-yellow-400/90 translate-x-3 -translate-y-3 drop-shadow-md" />
            </div>
            
            <h2 className="text-2xl font-black text-white mb-3">
              Pro Access Required
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-8">
              This test contains advanced materials and complex configurations that are only available to our Pro members. Upgrade your account to unlock this feature.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link 
                href="/pricing"
                className="w-full py-4 rounded-xl font-bold text-gray-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 shadow-lg shadow-yellow-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" /> Upgrade to Pro
              </Link>
              <Link 
                href="/test" 
                className="w-full py-4 rounded-xl font-bold text-gray-300 bg-transparent hover:bg-gray-800/50 border border-transparent hover:border-gray-700 transition-all"
              >
                Go back to free tests
              </Link>
            </div>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, 20px) scale(0.9); } }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-blob { animation: blob 7s infinite; }
          .animate-scale-in { animation: scale-in 0.4s ease-out; }
        `}</style>
      </div>
    );
  }

  if (isFinished && isLoggedIn) {
    const mistakes = questions.map((q, index) => {
      const userAnswer = userAnswers.find(ua => ua.questionId === q.testQuestionId);
      const selectedIdx = userAnswer ? userAnswer.selectedAnswerIndex : null;
      const isCorrect = selectedIdx === q.correctAnswerIndex;
      return { question: q, selectedIdx, isCorrect };
    }).filter(item => !item.isCorrect);

    return (
      <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 flex items-center justify-center p-6 py-12">
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
        
        <div className="max-w-3xl w-full animate-scale-in flex flex-col max-h-full">
          <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-8 md:p-10 text-center shadow-2xl border border-purple-500/30 relative flex flex-col max-h-[85vh]">
            
            <div className="shrink-0">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-600/20 animate-float rotate-3">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Test Completed!
              </h2>
              
              <div className="bg-gray-950/50 border border-gray-800 rounded-2xl p-6 mb-6 inline-block min-w-[250px] shadow-inner">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Final Score</p>
                <p className="text-5xl font-black text-white">
                  {score} <span className="text-2xl text-gray-600">/ {questions.length * 10}</span>
                </p>
              </div>
            </div>

            {mistakes.length > 0 && (
              <div className="mt-2 mb-6 text-left w-full overflow-y-auto pr-2 custom-scrollbar flex-1 border-t border-gray-800 pt-6">
                <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> 
                  Questions to Review ({mistakes.length})
                </h3>
                <div className="space-y-4">
                  {mistakes.map((mistake, i) => (
                    <div key={i} className="bg-gray-950/50 p-5 rounded-2xl border border-red-500/20 transition-colors hover:border-red-500/40">
                      <p className="font-medium text-gray-200 mb-4 text-lg">
                        <Latex>{mistake.question.questionText}</Latex>
                      </p>
                      
                      <div className="flex flex-col gap-2 bg-gray-900 rounded-xl p-3">
                        <p className="text-sm text-red-400 flex items-start gap-2">
                          <X className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>Your answer:</strong> <Latex>{mistake.selectedIdx !== null && mistake.question.possibleAnswers ? mistake.question.possibleAnswers[mistake.selectedIdx] : "Time expired / No answer"}</Latex>
                          </span>
                        </p>
                        <p className="text-sm text-green-400 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>
                            <strong>Correct answer:</strong> <Latex>{mistake.question.possibleAnswers ? mistake.question.possibleAnswers[mistake.question.correctAnswerIndex] : ""}</Latex>
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mistakes.length === 0 && (
              <div className="mt-4 mb-8 text-green-400 font-medium">
                Perfect! You didn't make any mistakes. 🎉
              </div>
            )}

            {/* Butoane Jos */}
            <div className="shrink-0 mt-auto">
              <Link 
                href="/test" 
                className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 transition-all mb-4"
              >
                <ArrowLeft className="w-5 h-5" /> Back to Tests
              </Link>

              {isSavingResult ? (
                  <p className="text-sm text-yellow-400 animate-pulse">Saving your results...</p>
              ) : (
                  <p className="text-sm text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4"/> Results saved to your profile
                  </p>
              )}
            </div>

          </div>
        </div>
        {toastElement}
        <style jsx>{`
          @keyframes blob { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(-20px, 20px) scale(0.9); } }
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .animate-scale-in { animation: scale-in 0.4s ease-out; }
          /* Scrollbar custom pentru zona de greseli */
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(17, 24, 39, 0.5); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.5); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.8); }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 py-8">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      
      <div className="max-w-3xl mx-auto p-4 md:p-6 relative z-10 animate-fade-in-up">
        {/* Header (Progress bar, Timer) */}
        <div className="flex items-center justify-between mb-8 bg-gray-900/60 backdrop-blur-md p-5 rounded-2xl shadow-lg border border-purple-500/20">
          <div className="flex-1">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500" style={{ width: `${((currentQuestionIndex) / questions.length) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-6 ml-8">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Score</p>
              <p className="text-lg font-black text-violet-300">{score} pts</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold border transition-colors ${isTimeRunningOut ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' : 'bg-gray-950/50 text-gray-300 border-gray-800'}`}>
              <Timer className="w-5 h-5" />
              <span className="w-12 text-center">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>

        {/* Zona Întrebării */}
        <div className="bg-gray-900/60 backdrop-blur-md rounded-3xl p-6 md:p-10 shadow-xl border border-purple-500/20 mb-6 relative overflow-hidden">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-tight">
            <Latex>{question.questionText}</Latex>
          </h2>

          {/* Randare condiționată pentru Configurații Matematice Speciale */}
          {question.matrixConfig && <MatrixRenderer config={question.matrixConfig} />}
          {question.viewConfig && <GraphRenderer config={question.viewConfig} />}

          {/* Opțiunile de Răspuns */}
          <div className="space-y-3 mt-8">
            {question.possibleAnswers?.map((option: string, idx: number) => {
              const isSelected = selectedOption === idx;
              const isCorrectAnswer = isShowingExplanation && idx === question.correctAnswerIndex;
              const isWrongSelection = isShowingExplanation && isSelected && !isCorrectAnswer;
              
              // Logica de stilizare bazată pe stare (Normal vs Rezultat afișat)
              let buttonStyle = "border-gray-800 bg-gray-950/50 hover:border-gray-600 hover:bg-gray-800";
              let textStyle = "text-gray-300 group-hover:text-white";
              let circleStyle = "border-gray-600 group-hover:border-gray-400";

              if (isShowingExplanation) {
                if (isCorrectAnswer) {
                  buttonStyle = "border-green-500 bg-green-500/10";
                  textStyle = "text-green-300";
                  circleStyle = "border-green-500 bg-green-500";
                } else if (isWrongSelection) {
                  buttonStyle = "border-red-500 bg-red-500/10";
                  textStyle = "text-red-300";
                  circleStyle = "border-red-500 bg-red-500";
                } else {
                  buttonStyle = "border-gray-800 bg-gray-950/30 opacity-50 cursor-not-allowed";
                }
              } else if (isSelected) {
                buttonStyle = "border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]";
                textStyle = "text-violet-300";
                circleStyle = "border-violet-500 bg-violet-500";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isShowingExplanation && setSelectedOption(idx)}
                  disabled={isShowingExplanation}
                  className={`w-full flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 outline-none text-left group ${buttonStyle}`}
                >
                  <span className={`text-lg font-medium transition-colors ${textStyle}`}>
                    <Latex>{option}</Latex>
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ml-4 ${circleStyle}`}>
                    {(isSelected || isCorrectAnswer) && <div className="w-2.5 h-2.5 bg-white rounded-full animate-scale-in" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Afișarea Explicației în caz de eroare */}
          {isShowingExplanation && question.explications && question.explications.length > 0 && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-red-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-red-300 mb-1">Incorrect. Here is why:</h4>
                  <div className="text-red-100/80 text-sm leading-relaxed space-y-2">
                    {question.explications.map((exp: string, i: number) => (
                      <p key={i}><Latex>{exp}</Latex></p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subsol - Hints și Buton de Acțiune */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {!isShowingExplanation && question.hints && question.hints.length > 0 ? (
            <div className="w-full md:w-auto flex-1">
              {!tipUsed ? (
                <button 
                  onClick={() => setTipUsed(true)}
                  className="flex items-center gap-2 text-sm font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-4 py-3 rounded-xl hover:bg-yellow-500/20 transition-colors w-full md:w-auto justify-center"
                >
                  <Lightbulb className="w-4 h-4" /> Need a hint? (-2 pts)
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
            onClick={handleActionClick}
            disabled={selectedOption === null}
            className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all active:scale-[0.98]
              ${isShowingExplanation 
                ? "bg-gray-800 hover:bg-gray-700 border border-gray-600" 
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-lg hover:shadow-purple-700/50"
              }
              disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed
            `}
          >
            {isShowingExplanation 
              ? "Continue" 
              : currentQuestionIndex === questions.length - 1 ? "Finish Test" : "Check Answer"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {toastElement}

      <style jsx>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}