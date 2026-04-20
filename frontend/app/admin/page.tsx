"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Plus, Search, Settings, FileText, Layers, 
  Edit, Trash2, X, AlertCircle, ShieldAlert, Filter, ListCollapse
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { jwtDecode } from "jwt-decode";

const TOPICS = [
  "Mathematical Analysis", "Physics", "C++ / Computer Programming", 
  "Special Mathematics", "Numerical Methods", "Data Structures", 
  "Discrete Mathematics", "Electrical Engineering", "Linear Algebra", 
  "Object-oriented programming"
];

const API_BASE_URL = "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"tests" | "decks">("tests");
  const [search, setSearch] = useState("");
  const [testFilter, setTestFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [tests, setTests] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);
  
  // State pentru formulare
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    status: "Private",
    time: 0,
    questions: [] as any[],
    cards: [] as any[] // Adaugat pentru decks
  });

  const [newQuestionData, setNewQuestionData] = useState({
    questionText: "",
    possibleAnswers: ["", "", "", ""],
    explications: [""],                
    correctAnswerIndex: 0,
    hints: [""]                       
  });
  const [newCardFront, setNewCardFront] = useState("");
  const [newCardBack, setNewCardBack] = useState("");
  
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTab === "tests") {
      const query = search.toLowerCase();
      return tests.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    } else {
      return decks;
    }
  }, [search, activeTab, tests, decks]);

  const fetchTestsList = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/test/getTestsFilter/${encodeURIComponent(testFilter)}`, {
        method: "GET",
        headers: getAuthHeaders()
      });
      const data = await res.json();
      
      if (res.ok) {
        setTests(data.tests || data || []); 
      } else {
        console.error("Error fetching tests:", data.message);
      }
    } catch (error) {
      console.error("Network error fetching tests:", error);
    }
  }, [testFilter, getAuthHeaders]);

  const fetchDecksList = useCallback(async () => {
    try {
      const query = search.trim();
      const endpoint = query 
        ? `${API_BASE_URL}/deck/getDecksByName/${encodeURIComponent(query)}`
        : `${API_BASE_URL}/deck/getAllDecks`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (res.ok && data.flag) {
        setDecks(query ? (data.deck ? [data.deck] : []) : (data.decks || []));
      } else {
        setDecks([]);
        if(query) console.warn(`Deck not found: ${data.message}`);
      }
    } catch (error) {
      console.error("Network error fetching decks:", error);
    }
  }, [search, getAuthHeaders]);

  useEffect(() => {
    const checkAuthorization = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || decoded.Role;
          const userId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.nameid || decoded.sub;
          
          if (userId) setCurrentUserId(userId);
          setIsLoggedIn(true);
          
          const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
          const isAdmin = roles.some(r => r === "admin" || r === "Admin");
          setIsAuthorized(isAdmin);
        } catch (error) {
          console.error("Invalid token:", error);
          setIsLoggedIn(false);
          setIsAuthorized(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsAuthorized(false);
      }
      setIsLoading(false);
    };

    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized && activeTab === "tests") {
      fetchTestsList();
    }
  }, [isAuthorized, activeTab, fetchTestsList]);

  useEffect(() => {
    if (!isAuthorized || activeTab !== "decks") return;

    const delayDebounceFn = setTimeout(() => {
      fetchDecksList();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [isAuthorized, activeTab, fetchDecksList]);


 const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...newQuestionData.possibleAnswers];
    newAnswers[index] = value;
    setNewQuestionData({ ...newQuestionData, possibleAnswers: newAnswers });
  };

  const handleAddQuestionLocal = () => {
    if (!newQuestionData.questionText.trim()) return;

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestionData]
    }));

    setNewQuestionData({
      questionText: "",
      possibleAnswers: ["", "", "", ""],
      explications: [""],
      correctAnswerIndex: 0,
      hints: [""]
    });
  };

  const handleSaveAllQuestionsToDB = async () => {
    if (formData.questions.length === 0 || !editingId) return;

    const payload = {
      testId: editingId,
      questions: formData.questions 
    };

    try {
      const response = await fetch(`${API_BASE_URL}/question/addQuestion`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && (data.flag === true || data.Flag === true)) {
        alert("Toate întrebările au fost salvate cu succes!");
      } else {
        alert(`Eroare: ${data.message}`);
      }
    } catch (error) {
      console.error("Eroare:", error);
    }
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleAddCard = () => {
    if (!newCardFront.trim() || !newCardBack.trim()) return;
    setFormData(prev => ({
      ...prev,
      cards: [...prev.cards, { front: newCardFront, back: newCardBack }]
    }));
    setNewCardFront("");
    setNewCardBack("");
  };

  const handleRemoveCard = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index)
    }));
  };

  const handleOpenModal = (item: any = null) => {
    setNewQuestionData({
      questionText: "",
      possibleAnswers: ["", "", "", ""],
      explications: [""],                
      correctAnswerIndex: 0,
      hints: [""]
    });
    setNewCardFront("");
    setNewCardBack("");

    if (item) {
      const currentId = item.deckId || item.testId || item.id;
      setEditingId(currentId);
      
      if (activeTab === "tests") {
        setFormData({ 
          title: item.title || item.Title, 
          description: item.description || item.Description, 
          topic: item.topic || item.Topic, 
          status: "Private",
          time: item.time || item.Time || 0,
          questions: item.questions || item.Questions || [],
          cards: [] 
        });
      } else {
        const mappedStatus = item.status === true ? "Public" : "Private";
        setFormData({ 
          title: item.title || item.Title, 
          description: item.description || item.Description, 
          topic: item.topic || item.Topic, 
          status: mappedStatus, 
          time: 0,
          questions: [],
          cards: item.cards || item.Cards || [] // preluare carduri existente
        });
      }
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", topic: "", status: "Private", time: 0, questions: [], cards: [] });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (activeTab === "decks") {
        const payload = { DeckId: id};
        const res = await fetch(`${API_BASE_URL}/deck/deleteDeck`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        
        if (res.ok && data.flag) {
          setDecks(decks.filter(d => d.id !== id && d.deckId !== id));
        } else alert(`Deletion error: ${data.message || "Unknown error occurred."}`);
      } else {
        const payload = { TestId: id, UserId: currentUserId };
        const res = await fetch(`${API_BASE_URL}/test/deleteTest`, { 
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload) 
        });
        
        if (res.ok) {
          setTests(tests.filter(t => t.testId !== id && t.id !== id));
        } else {
          const data = await res.json();
          alert(`Deletion error: ${data.message || "Unknown error occurred."}`);
        }
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("A network error has occurred.");
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      if (activeTab === "tests") {
        if (!editingId) {
          const payload = { 
            Title: formData.title, 
            Description: formData.description, 
            Topic: formData.topic, 
            Time: Number(formData.time),
            Questions: formData.questions 
          };
          const res = await fetch(`${API_BASE_URL}/test/addTest`, {
            method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) 
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            await fetchTestsList(); 
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        } else {
          const payload = { 
            TestId: editingId,
            UserId: currentUserId,
            Title: formData.title, 
            Description: formData.description, 
            Topic: formData.topic, 
            Status: formData.status,
            Time: Number(formData.time),
            Questions: formData.questions 
          };
          
          const res = await fetch(`${API_BASE_URL}/test/editTest`, {
            method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            await fetchTestsList();
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        }
      } else {
        if (!editingId) {
          const payload = { 
            UserId: currentUserId, 
            Title: formData.title, 
            Description: formData.description, 
            Topic: formData.topic, 
            Status: formData.status,
            Cards: formData.cards
          };
          const res = await fetch(`${API_BASE_URL}/deck/addDeck`, {
            method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            await fetchDecksList();
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        } else {
          const payload = { 
            DeckId: editingId,  
            Title: formData.title, 
            Description: formData.description, 
            Topic: formData.topic, 
            Status: String(formData.status),
            Cards: formData.cards
          };
          
          const res = await fetch(`${API_BASE_URL}/deck/editDeck`, {
            method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            await fetchDecksList();
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        }
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Problem communicating with the server.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ==========================================
  // 6. RENDER
  // ==========================================

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  
  if (!isAuthorized) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-100 p-4">
      <div className="flex flex-col items-center max-w-md text-center animate-fade-in-up mt-20">
        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mb-6"><ShieldAlert className="w-12 h-12 text-red-500" /></div>
        <h1 className="text-3xl font-black text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-8">You do not have the required permissions. Only administrators can manage resources.</p>
        <a href="/" className="px-8 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-700">Back to home page</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950 text-gray-100">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-900/50 animate-float">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-red-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Workspace
                </h1>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-purple-500/20">
                <div className="text-2xl font-bold text-white">{tests.length}</div>
                <div className="text-xs text-gray-400 font-medium">Tests</div>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/60 backdrop-blur-md shadow-lg border border-pink-500/20">
                <div className="text-2xl font-bold text-white">{decks.length}</div>
                <div className="text-xs text-gray-400 font-medium">Decks</div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center">
            
            <div className="flex p-1 bg-gray-900/60 backdrop-blur-md border border-gray-800 rounded-2xl w-full lg:w-auto">
              <button
                onClick={() => setActiveTab("tests")}
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "tests" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <FileText className="w-4 h-4" /> Tests
              </button>
              <button
                onClick={() => setActiveTab("decks")}
                className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === "decks" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Layers className="w-4 h-4" /> Decks
              </button>
            </div>

            {activeTab === "tests" && (
              <div className="relative group w-full lg:w-auto min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
                <select
                  value={testFilter}
                  onChange={(e) => setTestFilter(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-purple-500/30 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 shadow-lg transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="all">All topics</option>
                  {TOPICS.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex-1 relative group w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === "tests" ? "Search tests in results..." : "Search decks by exact name..."}
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-purple-500/30 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 shadow-lg transition-all font-medium"
              />
            </div>

            <button
              onClick={() => handleOpenModal()}
              className="w-full lg:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-900/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              Add {activeTab === "tests" ? "Test" : "Deck"}
            </button>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {filteredItems.map((item: any, index) => {
                const displayStatus = item.status === true ? "Public" : "Private";
                return (
                  <div 
                    key={item.id || item.testId || item.deckId || index} 
                    style={{ animationDelay: `${index * 75}ms` }} 
                    className="animate-slide-up bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-colors relative overflow-hidden"
                  >
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-gray-800 text-purple-400 border border-gray-700">
                          {item.topic}
                        </span>
                        {activeTab === "decks" && (
                          <span className={`px-2 py-1 text-xs font-bold rounded-md ${displayStatus === 'Public' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {displayStatus}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-3 mb-6">{item.description}</p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-800/80 mt-auto">
                      <div className="text-sm font-medium text-gray-500">
                        {activeTab === "tests" ? `Time: ${item.time || 0} min` : ``}
                        {activeTab === "tests" && item.questions && (
                          <span className="ml-3 text-purple-400">{item.questions.length} Questions</span>
                        )}
                        {activeTab === "decks" && item.cards && (
                          <span className="ml-3 text-pink-400">{item.cards.length} Cards</span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenModal(item)} 
                          className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white hover:bg-violet-600 transition-all border border-gray-700/50 hover:border-violet-500"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.testId || item.deckId || item.id)} 
                          className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white hover:bg-red-600 transition-all border border-gray-700/50 hover:border-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm mt-8">
            <div className="relative mb-6"><div className="w-32 h-32 rounded-3xl bg-gray-800/50 border border-gray-700 flex items-center justify-center shadow-inner"><AlertCircle className="w-16 h-16 text-gray-500" /></div></div>
            <p className="text-2xl font-bold text-white mb-2">No data found</p>
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-3xl rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="relative px-8 py-6 bg-gradient-to-r from-violet-900 via-purple-900 to-gray-900 border-b border-purple-500/20 shrink-0">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center">
                    {editingId ? <Edit className="w-6 h-6 text-purple-300" /> : <Plus className="w-6 h-6 text-purple-300" />}
                  </div>
                  <h2 className="text-2xl font-black text-white">
                    {editingId ? "Edit" : "Create"} {activeTab === "tests" ? "Test" : "Deck"}
                  </h2>
                </div>
                <button disabled={isSubmitting} onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-2"><X className="w-6 h-6" /></button>
              </div>
            </div>

            <div className="px-8 py-8 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Full title..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Detailed description..."
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Domain / Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-gray-900 text-gray-500">Choose domain...</option>
                    {TOPICS.map((topic) => (
                      <option key={topic} value={topic} className="bg-gray-900 text-white">{topic}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  {activeTab === "tests" ? (
                    <>
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Time (minutes)</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: parseInt(e.target.value) || 0})}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium"
                      />
                    </>
                  ) : (
                    <>
                      <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Visibility Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all font-medium appearance-none cursor-pointer"
                      >
                        <option value="Private" className="bg-gray-900 text-white">Private</option>
                        <option value="Public" className="bg-gray-900 text-white">Public</option>
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* SECȚIUNE ADAUGARE/EDITARE INTREBARI SAU CARDURI */}
              {editingId && (
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-300 uppercase tracking-wide">
                      <ListCollapse className="w-4 h-4 text-purple-400" />
                      {activeTab === "tests" ? `Questions (${formData.questions?.length || 0})` : `Cards (${formData.cards?.length || 0})`}
                    </label>
                  </div>
                  
                  {/* Adăugare Question */}
                  {activeTab === "tests" && (
                    <div className="flex flex-col gap-6 mb-4">
                      
                      {/* --- FORMULAR ADĂUGARE ÎNTREBARE NOUĂ --- */}
                      <div className="flex flex-col gap-4 p-5 bg-gray-800/40 rounded-2xl border border-gray-700/50 shadow-inner">
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <Plus className="w-5 h-5 text-violet-400" /> Create New Question
                        </h3>

                        {/* 1. Question Text */}
                        <textarea
                          value={newQuestionData.questionText}
                          onChange={(e) => setNewQuestionData({...newQuestionData, questionText: e.target.value})}
                          placeholder="Type the main question here..."
                          className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium resize-none"
                          rows={2}
                        />

                        {/* 2. Possible Answers & Correct Answer Index */}
                        <div className="space-y-3">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Possible Answers (Select the correct one)
                          </label>
                          {newQuestionData.possibleAnswers.map((ans, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={newQuestionData.correctAnswerIndex === idx}
                                  onChange={() => setNewQuestionData({...newQuestionData, correctAnswerIndex: idx})}
                                  className="w-5 h-5 accent-violet-500 cursor-pointer"
                                  title="Mark as correct answer"
                                />
                              </div>
                              <input
                                type="text"
                                value={ans}
                                onChange={(e) => handleAnswerChange(idx, e.target.value)}
                                placeholder={`Answer option ${idx + 1}...`}
                                className={`flex-1 px-4 py-2.5 rounded-xl border bg-gray-950/50 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                                  newQuestionData.correctAnswerIndex === idx 
                                    ? 'border-violet-500 ring-1 ring-violet-500/30' 
                                    : 'border-gray-700 focus:border-gray-500'
                                }`}
                              />
                            </div>
                          ))}
                        </div>

                        {/* 3. Hints & Explications */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hint (Optional)</label>
                            <input
                              type="text"
                              value={newQuestionData.hints[0]}
                              onChange={(e) => setNewQuestionData({...newQuestionData, hints: [e.target.value]})}
                              placeholder="Helpful clue..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Explication (Optional)</label>
                            <input
                              type="text"
                              value={newQuestionData.explications[0]}
                              onChange={(e) => setNewQuestionData({...newQuestionData, explications: [e.target.value]})}
                              placeholder="Why is this the answer?..."
                              className="w-full px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* 4. Buton adăugare locală */}
                        <button
                          type="button"
                          onClick={handleAddQuestionLocal}
                          disabled={!newQuestionData.questionText.trim()}
                          className="mt-2 w-full px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Plus className="w-5 h-5" /> Add Question to List
                        </button>
                      </div>
                      {/* --- END FORMULAR --- */}

                      {/* LISTA DE ÎNTREBĂRI ADĂUGATE (PREVIEW) */}
                      {formData.questions.length > 0 && (
                        <div className="space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider">
                              Ready to save ({formData.questions.length})
                            </h4>
                          </div>
                          {formData.questions.map((q, idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-4 bg-green-900/10 border border-green-500/30 rounded-xl text-white relative group">
                              <div className="flex justify-between items-start">
                                <span className="font-bold">{idx + 1}. {q.questionText}</span>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveQuestion(idx)} 
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-sm text-gray-400">
                                <span className="text-green-400 font-medium">Corect: </span> 
                                {q.possibleAnswers[q.correctAnswerIndex] || "N/A"}
                              </p>
                            </div>
                          ))}

                          {/* BUTONUL FINAL CĂTRE BACKEND */}
                          <button
                            type="button"
                            onClick={handleSaveAllQuestionsToDB} // Aceasta e funcția de care am vorbit în pasul anterior
                            disabled={formData.questions.length === 0 || !editingId}
                            className="mt-4 w-full px-4 py-4 rounded-xl bg-green-600 hover:bg-green-500 text-white font-bold text-lg shadow-lg shadow-green-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Save All Questions to DB
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Adăugare Card */}
                  {activeTab === "decks" && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <input
                        type="text"
                        value={newCardFront}
                        onChange={(e) => setNewCardFront(e.target.value)}
                        placeholder="Card Front (e.g. Concept)"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                      />
                      <input
                        type="text"
                        value={newCardBack}
                        onChange={(e) => setNewCardBack(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCard())}
                        placeholder="Card Back (e.g. Definition)"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-700 bg-gray-950/50 text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={handleAddCard}
                        disabled={!newCardFront.trim() || !newCardBack.trim()}
                        className="px-4 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" /> Add
                      </button>
                    </div>
                  )}

                  {/* Lista de elemente salvate în form */}
                  <div className="bg-gray-950/50 border border-gray-700/50 rounded-xl p-4 max-h-60 overflow-y-auto space-y-3 shadow-inner">
                    {activeTab === "tests" ? (
                      formData.questions && formData.questions.length > 0 ? (
                        formData.questions.map((q: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-900 border border-gray-800 hover:border-purple-500/30 transition-colors rounded-lg flex items-start justify-between gap-4">
                            <p className="text-sm text-gray-200 font-medium leading-relaxed">
                              <span className="text-violet-400 font-black mr-2">Q{idx + 1}:</span>
                              {typeof q === 'string' ? q : q.text || q.content || q.title || JSON.stringify(q)}
                            </p>
                            <button 
                              onClick={() => handleRemoveQuestion(idx)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                          <FileText className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm font-medium italic">No questions added yet.</p>
                        </div>
                      )
                    ) : (
                      formData.cards && formData.cards.length > 0 ? (
                        formData.cards.map((c: any, idx: number) => (
                          <div key={idx} className="p-4 bg-gray-900 border border-gray-800 hover:border-pink-500/30 transition-colors rounded-lg flex items-start justify-between gap-4">
                            <div className="text-sm text-gray-200 font-medium leading-relaxed w-full grid grid-cols-2 gap-4">
                              <div><span className="text-pink-400 font-black mr-2">F:</span> {c.front || c.Front || c.title || JSON.stringify(c)}</div>
                              <div><span className="text-blue-400 font-black mr-2">B:</span> {c.back || c.Back || c.description || ""}</div>
                            </div>
                            <button 
                              onClick={() => handleRemoveCard(idx)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-gray-500">
                          <Layers className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm font-medium italic">No cards added yet.</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            </div>

            <div className="px-8 py-6 bg-gray-900 border-t border-gray-800 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => setShowModal(false)} 
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title.trim() || !formData.topic || isSubmitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold shadow-lg shadow-purple-900/40 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {editingId ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

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
      `}</style>
    </div>
  );
}