import { useEffect, useRef } from 'react'
import { createChart, CrosshairMode } from 'lightweight-charts'

export default function Chart({ data, dark=true, height=280 }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    // cleanup any existing
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
    }
    const bg = dark ? '#0f172a' : '#ffffff'
    const text = dark ? '#cbd5e1' : '#0f172a'
    const grid = dark ? '#1e293b' : '#e2e8f0'

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { type: 'solid', color: bg },
        textColor: text,
      },
      grid: {
        vertLines: { color: grid },
        horzLines: { color: grid },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false },
    })
    chartRef.current = chart
    const candle = chart.addCandlestickSeries()
    seriesRef.current = candle

    return () => {
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
  }, [dark, height])

  useEffect(()=>{
    if (!seriesRef.current) return
    if (!data || data.length === 0) return
    const mapped = data.map(d => ({ time: d.t, open: d.o, high: d.h, low: d.l, close: d.c }))
    seriesRef.current.setData(mapped)
  }, [data])

  return <div ref={containerRef} className="w-full" />
}
