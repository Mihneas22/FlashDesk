"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, Sparkles, Paperclip, Loader2, Microscope, TestTube, X, AlertCircle, CheckCircle, Terminal } from "lucide-react";
import { Navbar } from "@/components/navbar";

// Tipul actualizat pentru a suporta butoane de selecție
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  options?: string[]; // Opțiuni selectabile pentru utilizator
};

// Datele pentru Materii și Laboratoare
const TOPICS = [
  "Mathematical Analysis",
  "Physics",
  "Chemistry",
];

const LAB_VARIANTS: Record<string, string[]> = {
  "Mathematical Analysis": ["Limits & Derivatives", "Integrals Evaluation", "Series Convergence", "Differential Equations"],
  "Physics": ["Mechanics: Pendulum", "Thermodynamics", "Optics: Lenses", "Circuit Analysis"],
  "Chemistry": ["Acid-Base Titration", "Calorimetry", "Spectrophotometry", "Ideal Gas Law"],
};

// Tipurile de pași din conversație
type ChatStep = "select_topic" | "select_variant" | "free_chat";

export default function LabAssistantPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  // Starea pentru parcursul logic al chatului
  const [chatStep, setChatStep] = useState<ChatStep>("select_topic");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI Lab Assistant. To get started, please select the subject you want to work on:",
      options: TOPICS // Afișăm materiile la început
    }
  ]);
  
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: "error" | "success" | "info" = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
      showToast(`File "${e.target.files[0].name}" attached successfully.`, "success");
    }
  };

  // Funcție pentru gestionarea opțiunilor predefinite (Butoanele din chat)
  const handleOptionSelect = (option: string) => {
    // Adăugăm alegerea utilizatorului în chat
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: option };
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);

    if (chatStep === "select_topic") {
      setSelectedTopic(option);
      setTimeout(() => {
        const nextMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Great choice! Now, please select the specific lab calculation for **${option}**:`,
          options: LAB_VARIANTS[option] || []
        };
        setMessages(prev => [...prev, nextMsg]);
        setChatStep("select_variant");
        setIsTyping(false);
      }, 1000);
    } 
    else if (chatStep === "select_variant") {
      setTimeout(() => {
        const nextMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Perfect! We are now focusing on **${option}** (${selectedTopic}). You can now type your questions or upload your lab instructions!`,
        };
        setMessages(prev => [...prev, nextMsg]);
        setChatStep("free_chat"); // Deblocăm input-ul
        setIsTyping(false);
      }, 1000);
    }
  };

  // Funcția standard pentru trimiterea mesajelor libere
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (chatStep !== "free_chat") return; // Prevenim trimiterea dacă nu e în stadiul de chat liber
    
    if (!inputValue.trim() && !attachedFile) return;

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setAttachedFile(null);
    setIsTyping(true);

    setTimeout(() => {
      const newBotMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've analyzed your query based on the lab parameters we set up. Here is a step-by-step breakdown..."
      };
      setMessages(prev => [...prev, newBotMsg]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100 flex flex-col">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Header Section */}
        <div className="mb-6 animate-fade-in shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-900/50 animate-float">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                Virtual Lab Assistant
                <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Your AI-powered companion for practical assignments and coding.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-gray-900/60 backdrop-blur-md border border-purple-500/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up relative">
          
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-50" />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-purple-600 to-pink-600 shadow-purple-900/50" 
                    : "bg-gray-800 border border-gray-700 shadow-gray-900/50"
                }`}>
                  {msg.role === "user" ? <Terminal className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-cyan-400" />}
                </div>

                {/* Bubble content */}
                <div className="flex flex-col gap-3">
                  <div className={`px-5 py-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md rounded-tr-sm"
                      : "bg-gray-800/80 border border-gray-700 text-gray-200 shadow-md rounded-tl-sm backdrop-blur-sm"
                  }`}>
                    {/* Rendare simplă pentru bold (ex: **Text**) - Opțional poți folosi react-markdown aici pe viitor */}
                    {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-cyan-300">{part}</strong> : part)}
                  </div>
                  
                  {/* Afișare opțiuni (butoane) doar dacă e ultimul mesaj de la bot și nu scrie */}
                  {msg.options && index === messages.length - 1 && !isTyping && (
                    <div className="flex flex-wrap gap-2 animate-fade-in-up mt-1">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(opt)}
                          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800/80 text-cyan-100 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/50 hover:-translate-y-0.5 transition-all shadow-lg shadow-black/20 flex items-center gap-2"
                        >
                          {chatStep === "select_topic" ? <Microscope className="w-4 h-4 text-cyan-400" /> : <TestTube className="w-4 h-4 text-purple-400" />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 max-w-[80%] mr-auto animate-fade-in">
                <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 mt-1 shadow-lg">
                  <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-gray-800/80 border border-gray-700 rounded-tl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-gray-900 border-t border-gray-800">
            {attachedFile && chatStep === "free_chat" && (
              <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-cyan-900/20 border border-cyan-500/30 rounded-lg w-fit animate-scale-in text-sm text-cyan-200">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <span className="truncate max-w-[200px] font-medium">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="ml-2 hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
              {/* Ascundem/Dezactivăm atașamentul până la Free Chat */}
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.txt,.c,.cpp,.py,.java"
                disabled={chatStep !== "free_chat"}
              />
              <label
                htmlFor="file-upload"
                className={`p-3 rounded-xl border shrink-0 transition-colors ${
                  chatStep === "free_chat" 
                    ? "bg-gray-800 text-gray-400 hover:text-cyan-400 hover:bg-gray-700 cursor-pointer border-gray-700" 
                    : "bg-gray-900 text-gray-700 border-gray-800 cursor-not-allowed"
                }`}
                title={chatStep === "free_chat" ? "Attach lab instructions or code" : "Please complete selections first"}
              >
                <Paperclip className="w-5 h-5" />
              </label>

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={chatStep !== "free_chat"}
                placeholder={
                  chatStep === "select_topic" ? "Please select a topic from above..." :
                  chatStep === "select_variant" ? "Please select a lab variant from above..." :
                  "Ask about your lab assignment..."
                }
                className="flex-1 px-5 py-3.5 rounded-xl bg-gray-950/50 border border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              />

              <button
                type="submit"
                disabled={chatStep !== "free_chat" || (!inputValue.trim() && !attachedFile) || isTyping}
                className="p-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/40 hover:shadow-cyan-700/50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shrink-0 group"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
              </button>
            </form>
            <div className="mt-3 text-center">
              <p className="text-[11px] text-gray-500">
                AI Assistant can make mistakes. Verify critical lab calculations and safety procedures.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-center gap-3 animate-slide-up transition-all ${
          toast.type === "error" ? "bg-red-950/90 border-red-500/50 text-red-200" : 
          toast.type === "success" ? "bg-green-950/90 border-green-500/50 text-green-200" :
          "bg-cyan-950/90 border-cyan-500/50 text-cyan-200"
        }`}>
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400" />}
          {toast.type === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
          {toast.type === "info" && <Bot className="w-5 h-5 text-cyan-400" />}
          <p className="font-semibold text-sm mr-2">{toast.message}</p>
          <button onClick={() => setToast(prev => ({ ...prev, show: false }))} className="p-1 rounded-lg hover:bg-black/20 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Style-urile JSX au rămas identice */}
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
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.5s ease-out backwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #4b5563; border-radius: 20px; }
      `}</style>
    </div>
  );
}