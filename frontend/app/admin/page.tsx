"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Plus, Search, Sparkles, Settings, FileText, Layers, 
  Edit, Trash2, X, AlertCircle, ShieldAlert, Filter
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { jwtDecode } from "jwt-decode";

const TOPICS = [
  "Mathematical Analysis", "Physics", "C++ / Computer Programming", 
  "Special Mathematics", "Numerical Methods", "Data Structures", 
  "Discrete Mathematics", "Electrical Engineering", "Linear Algebra", 
  "Object-oriented programming"
];

// Base API Domain - adjust the port if necessary
const API_BASE_URL = "http://localhost:5000/api";

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<"tests" | "decks">("tests");
  const [search, setSearch] = useState("");
  
  // Filter state
  const [testFilter, setTestFilter] = useState("all");
  
  // Data states
  const [tests, setTests] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    topic: "",
    status: "Private",
    time: 0
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }, []);

  // 1. Authorization Check
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

  // 2. Fetch Tests based on filter
  useEffect(() => {
    const fetchTests = async () => {
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
    };

    if (isAuthorized && activeTab === "tests") {
      fetchTests();
    }
  }, [testFilter, isAuthorized, getAuthHeaders, activeTab]);

  // 3. Fetch Decks based on search input (Debounced API Call)
  useEffect(() => {
    if (!isAuthorized || activeTab !== "decks") return;

    const fetchDecks = async () => {
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
          if (query) {
            setDecks(data.deck ? [data.deck] : []);
          } else {
            setDecks(data.decks || []);
          }
        } else {
          setDecks([]);
          if(query) console.warn(`Deck not found: ${data.message}`);
        }
      } catch (error) {
        console.error("Network error fetching decks:", error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchDecks();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search, activeTab, isAuthorized, getAuthHeaders]);


  // Secondary Frontend Search (Only for Tests since Decks use API search)
  const filteredItems = useMemo(() => {
    if (activeTab === "tests") {
      const query = search.toLowerCase();
      return tests.filter(t => t.title?.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query));
    } else {
      return decks;
    }
  }, [search, activeTab, tests, decks]);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      if (activeTab === "tests") {
        setFormData({ title: item.title, description: item.description, topic: item.topic, status: "Private", time: item.time || 0 });
      } else {
        setFormData({ title: item.title, description: item.description, topic: item.topic, status: item.status || "Private", time: 0 });
      }
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", topic: "", status: "Private", time: 0 });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      if (activeTab === "decks") {
        const payload = { DeckId: id, UserId: currentUserId };
        
        const res = await fetch(`${API_BASE_URL}/deck/deleteDeck`, {
          method: "DELETE",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (res.ok && data.flag) {
          setDecks(decks.filter(d => d.id !== id));
        } else {
          alert(`Deletion error: ${data.message || "Unknown error occurred."}`);
        }
      } else {
        // Logica completată pentru ștergerea unui Test
        const res = await fetch(`${API_BASE_URL}/test/deleteTest/${id}`, { 
          method: 'DELETE',
          headers: getAuthHeaders() 
        });
        
        // În funcție de cum returnează backend-ul, adaptăm (aici presupunem un răspuns standard cu flag)
        if (res.ok) {
          setTests(tests.filter(t => t.id !== id));
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
          // Add Test
          const payload = { Title: formData.title, Description: formData.description, Topic: formData.topic, Time: Number(formData.time) };
          const res = await fetch(`${API_BASE_URL}/test/addTest`, {
            method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload) 
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            if (testFilter === "all" || testFilter === formData.topic) {
                setTests([...tests, { 
                  id: data.id || Date.now().toString(), // Ideal ar fi să preiei ID-ul din backend dacă e returnat
                  title: formData.title, description: formData.description, topic: formData.topic, time: Number(formData.time), questions: 0
                }]);
            }
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        } else {
            // Logica completată pentru Edit Test
            const payload = { 
              TestId: editingId, // Adaptat pentru DTO-ul specific de C# (sau Id, depinde de backend)
              Title: formData.title, 
              Description: formData.description, 
              Topic: formData.topic, 
              Time: Number(formData.time) 
            };
            
            const res = await fetch(`${API_BASE_URL}/test/editTest`, {
              method: "PUT", 
              headers: getAuthHeaders(), 
              body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok && data.flag) {
              setTests(tests.map(t => t.id === editingId ? { ...t, title: formData.title, description: formData.description, topic: formData.topic, time: Number(formData.time) } : t));
              setShowModal(false);
            } else alert(`Error: ${data.message}`);
        }
      } else {
        // Logica pentru DECKS
        if (!editingId) {
          // Add Deck
          const payload = { UserId: currentUserId, Title: formData.title, Description: formData.description, Topic: formData.topic, Status: formData.status };
          const res = await fetch(`${API_BASE_URL}/deck/addDeck`, {
            method: "POST", headers: getAuthHeaders(), body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            setDecks([...decks, { id: data.id || Date.now().toString(), title: formData.title, description: formData.description, topic: formData.topic, status: formData.status }]);
            setShowModal(false);
          } else alert(`Error: ${data.message}`);
        } else {
          // Edit Deck
          const payload = { 
            DeckId: editingId, 
            UserId: currentUserId, 
            Title: formData.title, 
            Description: formData.description, 
            Topic: formData.topic, 
            Status: formData.status 
          };
          
          const res = await fetch(`${API_BASE_URL}/deck/editDeck`, {
            method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(payload)
          });
          const data = await res.json();

          if (res.ok && data.flag) {
            setDecks(decks.map(d => d.id === editingId ? { ...d, title: formData.title, description: formData.description, topic: formData.topic, status: formData.status } : d));
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

  if (isLoading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" /></div>;
  
  if (!isAuthorized) return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-gray-100 p-4">
      <Navbar isLoggedIn={isLoggedIn} />
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
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-900" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000" />
      </div>

      <Navbar isLoggedIn={isLoggedIn} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-10 animate-fade-in">
          {/* Header Stats */}
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

          {/* Control Bar */}
          <div className="mt-8 flex flex-col lg:flex-row gap-4 items-center">
            
            {/* Tabs Selector */}
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

            {/* API Filter Dropdown (Only for Tests) */}
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

            {/* Search Bar */}
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

            {/* Add Button */}
            <button
              onClick={() => handleOpenModal()}
              className="w-full lg:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white font-bold text-lg shadow-xl shadow-purple-900/40 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              Add {activeTab === "tests" ? "Test" : "Deck"}
            </button>
          </div>
        </div>

        {/* Item Rendering */}
        {filteredItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in-up">
            {filteredItems.map((item: any, index) => (
              <div key={item.id || index} style={{ animationDelay: `${index * 75}ms` }} className="animate-slide-up bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-3xl p-6 flex flex-col justify-between group hover:border-purple-500/50 transition-colors relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg bg-gray-800 text-purple-400 border border-gray-700">
                      {item.topic}
                    </span>
                    {activeTab === "decks" && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${item.status === 'Public' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-6">{item.description}</p>
                </div>

                <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-800/80 mt-auto">
                  <div className="text-sm font-medium text-gray-500">
                    {activeTab === "tests" ? `Time: ${item.time || 0} min` : ``}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(item)} className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white hover:bg-violet-600 transition-all border border-gray-700/50 hover:border-violet-500"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 rounded-xl bg-gray-800/50 text-gray-300 hover:text-white hover:bg-red-600 transition-all border border-gray-700/50 hover:border-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-6 bg-gray-900/30 rounded-3xl border border-gray-800/50 backdrop-blur-sm mt-8">
            <div className="relative mb-6"><div className="w-32 h-32 rounded-3xl bg-gray-800/50 border border-gray-700 flex items-center justify-center shadow-inner"><AlertCircle className="w-16 h-16 text-gray-500" /></div></div>
            <p className="text-2xl font-bold text-white mb-2">No data found</p>
          </div>
        )}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmitting && setShowModal(false)} />
          <div className="relative w-full max-w-xl rounded-3xl bg-gray-900 border border-gray-800 shadow-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
            
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

      {/* Style JSX Identical for Animations */}
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