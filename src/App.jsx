import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import QuoteCard from "./components/QuoteCard.jsx";

function App() {
  const base = import.meta.env.VITE_BACKEND_URL;
  const [symbols, setSymbols] = useState(["AAPL","MSFT","GOOG","TSLA"]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId] = useState("demo-user");
  const [adding, setAdding] = useState(false);
  const [watchItems, setWatchItems] = useState([]);

  const fetchQuotes = async (syms) => {
    try {
      setLoading(true);
      const res = await fetch(`${base}/api/quotes?symbols=${encodeURIComponent(syms.join(","))}`);
      const data = await res.json();
      setQuotes(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchQuotes(symbols);
  }, []);

  const onSearch = async (sym) => {
    if (!symbols.includes(sym)) {
      const list = [...symbols, sym.toUpperCase()];
      setSymbols(list);
      fetchQuotes(list);
    }
  };

  const refreshWatch = async () => {
    try {
      const r = await fetch(`${base}/api/watchlist?user_id=${userId}`);
      const d = await r.json();
      setWatchItems(d.items || []);
    } catch (e) {}
  };

  useEffect(()=>{ refreshWatch(); },[]);

  const addToWatch = async () => {
    setAdding(true);
    try {
      const sym = prompt("Enter ticker (e.g., AAPL)");
      if (!sym) return;
      await fetch(`${base}/api/watchlist`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: userId, symbol: sym })});
      await refreshWatch();
    } finally { setAdding(false); }
  };

  const watchSymbols = useMemo(()=> (watchItems.map(w=>w.symbol?.toUpperCase()).filter(Boolean)),[watchItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar onSearch={onSearch} onAddWatch={addToWatch} />

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white text-xl font-semibold">Market Overview</h2>
            {loading && <span className="text-blue-300 text-sm">Loading…</span>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quotes.map(q => <QuoteCard key={q.symbol} q={q} />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Watchlist</h3>
            <button onClick={()=> fetchQuotes(watchSymbols.length? watchSymbols: symbols)} className="text-blue-300 text-sm hover:text-blue-200">Refresh</button>
          </div>
          <div className="space-y-3">
            {watchItems.length === 0 && (
              <div className="text-blue-300/70 text-sm">No items yet. Add your first symbol.</div>
            )}
            {watchItems.map(w => {
              const q = quotes.find(x=>x.symbol===w.symbol) || { symbol: w.symbol, name: w.name, price: 0, change: 0, percent_change: 0 };
              return <QuoteCard key={w._id} q={q} />
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;