import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import QuoteCard from "./components/QuoteCard.jsx";
import Chart from "./components/Chart.jsx";

function App() {
  const base = import.meta.env.VITE_BACKEND_URL;
  const [symbols, setSymbols] = useState(["AAPL","MSFT","GOOG","TSLA"]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId] = useState("demo-user");
  const [adding, setAdding] = useState(false);
  const [watchItems, setWatchItems] = useState([]);
  const [activeSymbol, setActiveSymbol] = useState("AAPL");
  const [series, setSeries] = useState([]);
  const [dark, setDark] = useState(true);

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

  const fetchChart = async (sym, interval="1m", range="1d") => {
    try {
      const res = await fetch(`${base}/api/chart/intraday?symbol=${encodeURIComponent(sym)}&interval=${interval}&range=${range}`)
      const data = await res.json();
      setSeries(data.series || [])
    } catch (e) {}
  }

  useEffect(() => {
    fetchQuotes(symbols);
    fetchChart(activeSymbol)
  }, []);

  useEffect(()=>{
    if (activeSymbol) fetchChart(activeSymbol)
  }, [activeSymbol])

  const onSearch = async (sym) => {
    if (!symbols.includes(sym)) {
      const list = [...symbols, sym.toUpperCase()];
      setSymbols(list);
      fetchQuotes(list);
    }
    setActiveSymbol(sym.toUpperCase());
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

  const placeOrder = async (side) => {
    const sym = activeSymbol || prompt("Symbol?")
    const qty = parseFloat(prompt(`Quantity to ${side}?`, "1"))
    if (!sym || !qty) return
    const last = quotes.find(q=>q.symbol===sym)?.price || 0
    try {
      await fetch(`${base}/api/orders`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ user_id: userId, symbol: sym, side, quantity: qty, price: last })})
      alert('Order placed!')
    } catch (e) { alert('Failed to place order') }
  }

  const watchSymbols = useMemo(()=> (watchItems.map(w=>w.symbol?.toUpperCase()).filter(Boolean)),[watchItems]);

  return (
    <div className={"min-h-screen "+(dark?"bg-slate-950":"bg-white") }>
      <Navbar onSearch={onSearch} onAddWatch={addToWatch} />

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={(dark?"text-white":"text-slate-900")+" text-xl font-semibold"}>Market Overview</h2>
            <div className="flex items-center gap-3">
              <button onClick={()=> setDark(d=>!d)} className="text-blue-300 text-sm hover:text-blue-200">{dark? 'Light':'Dark'} mode</button>
              {loading && <span className="text-blue-300 text-sm">Loading…</span>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={dark?"text-white":"text-slate-900"}>Intraday • {activeSymbol}</div>
              <div className="flex gap-2">
                <button onClick={()=>fetchChart(activeSymbol, '1m','1d')} className="text-blue-300 text-xs">1D</button>
                <button onClick={()=>fetchChart(activeSymbol, '5m','5d')} className="text-blue-300 text-xs">5D</button>
                <button onClick={()=>fetchChart(activeSymbol, '1d','1mo')} className="text-blue-300 text-xs">1M</button>
                <button onClick={()=>fetchChart(activeSymbol, '1d','6mo')} className="text-blue-300 text-xs">6M</button>
                <button onClick={()=>fetchChart(activeSymbol, '1wk','1y')} className="text-blue-300 text-xs">1Y</button>
              </div>
            </div>
            <Chart data={series} dark={dark} height={320} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quotes.map(q => (
              <div key={q.symbol} onClick={()=>setActiveSymbol(q.symbol)} className="cursor-pointer">
                <QuoteCard q={q} />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={()=> placeOrder('buy')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white">Buy</button>
            <button onClick={()=> placeOrder('sell')} className="px-3 py-2 rounded-lg bg-rose-600 text-white">Sell</button>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={(dark?"text-white":"text-slate-900")+" font-semibold"}>Watchlist</h3>
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