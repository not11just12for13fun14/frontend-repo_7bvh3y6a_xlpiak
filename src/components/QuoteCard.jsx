export default function QuoteCard({ q }) {
  const up = (q.change ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 hover:border-blue-500/40 transition">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-white font-semibold text-lg">{q.symbol}</div>
          <div className="text-blue-300 text-sm">{q.name || ''}</div>
        </div>
        <div className="text-right">
          <div className="text-white text-2xl font-bold">{q.price?.toFixed ? q.price.toFixed(2) : q.price}</div>
          <div className={"text-sm font-medium " + (up ? "text-emerald-400" : "text-rose-400") }>
            {(up?"+":"") + (q.change?.toFixed ? q.change.toFixed(2): q.change)} ({q.percent_change?.toFixed ? q.percent_change.toFixed(2): q.percent_change}%)
          </div>
        </div>
      </div>
    </div>
  );
}
