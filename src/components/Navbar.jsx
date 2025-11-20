import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar({ onSearch, onAddWatch }) {
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q) { setSuggestions([]); return; }
      try {
        const base = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${base}/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (e) {
        // ignore
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="w-full sticky top-0 z-20 backdrop-blur bg-slate-900/70 border-b border-blue-500/20">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <img src="/flame-icon.svg" className="h-8 w-8" />
        <div className="text-white font-semibold">BlueStocks</div>
        <div className="relative ml-auto w-full max-w-md">
          <div className="flex items-center gap-2 bg-slate-800/80 rounded-lg px-3 py-2 border border-slate-700">
            <Search className="h-4 w-4 text-blue-300" />
            <input value={q} onChange={e=>setQ(e.target.value)} onFocus={()=>setShowSug(true)} onBlur={()=>setTimeout(()=>setShowSug(false),150)} placeholder="Search stocks (AAPL, TCS, INFY)" className="bg-transparent outline-none text-blue-100 placeholder:text-blue-300/50 w-full" />
          </div>
          {showSug && suggestions.length>0 && (
            <div className="absolute mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
              {suggestions.map((s)=> (
                <button key={s.symbol} onMouseDown={()=>{onSearch(s.symbol); setQ(""); setShowSug(false);}} className="w-full text-left px-3 py-2 hover:bg-slate-700 text-blue-100 flex items-center justify-between">
                  <span>{s.symbol}</span>
                  <span className="text-blue-300 text-sm">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={onAddWatch} className="ml-3 inline-flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-500 transition px-3 py-2 rounded-lg">
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}
