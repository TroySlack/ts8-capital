"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar, ReferenceLine } from "recharts";

const COLORS = {
  primary: "#1a3a5c",
  accent: "#2563eb",
  accentLight: "#3b82f6",
  accentPale: "#dbeafe",
  accentFaint: "#eff6ff",
  green: "#059669",
  greenBg: "#ecfdf5",
  red: "#dc2626",
  redBg: "#fef2f2",
  orange: "#d97706",
  orangeBg: "#fffbeb",
  purple: "#7c3aed",
  purpleBg: "#f5f3ff",
  gray100: "#f8fafc",
  gray200: "#e2e8f0",
  gray300: "#cbd5e1",
  gray400: "#94a3b8",
  gray500: "#64748b",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1e293b",
  white: "#ffffff",
};

const SECTOR_COLORS = ["#2563eb","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#db2777","#0d9488","#4f46e5","#ca8a04","#6366f1"];
const TABS = ["TS-8 Fund", "Short-term", "Thesis / Analyst"];

const EMOTIONS = ["Calm","Confident","Anxious","Fearful","Greedy","FOMO","Frustrated","Euphoric","Bored"];
const MARKET_CONDITIONS = ["Trending Up","Trending Down","Choppy","Volatile","Range-bound","Gap Up","Gap Down"];
const SETUPS = ["Bull Flag","Bear Flag","VWAP Reclaim","VWAP Rejection","Opening Range Breakout","Momentum Scalp","Reversal","Range Breakout","News Play","Gap Fill","Support / Resistance","Other"];
const GRADES = ["A","B","C","D","F"];

const DEFAULT_PORTFOLIO = {
  "TS-8 Fund": {
    accountValue: 4000,
    holdings: [
      { ticker: "VTI", shares: 10, costBasis: 245.00, currentPrice: 252.30, sector: "Broad Market" },
    ],
    trades: [
      { date: "2025-03-15", action: "BUY", ticker: "VTI", shares: 10, price: 245.00, rationale: "Core passive position, broad market exposure" },
    ],
  },
  "Daytrading": { accountValue: 0, holdings: [], trades: [] },
};

// Real trades from Fidelity — all short-term realized gains/losses (same-day + multi-day holds)
const DEFAULT_JOURNAL = [
  // ── 04/14 same-day trades ──
  {
    id: 1, date: "2026-04-14", entryDate: "2026-04-14", holdingDays: 0,
    ticker: "TQQQ", direction: "LONG",
    entryPrice: 53.03, exitPrice: 53.24, shares: 4.67, stopLoss: 0,
    riskAmount: 0, pnl: 0.98, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  {
    id: 2, date: "2026-04-14", entryDate: "2026-04-14", holdingDays: 0,
    ticker: "QQQ", direction: "LONG",
    entryPrice: 626.60, exitPrice: 627.25, shares: 0.8, stopLoss: 0,
    riskAmount: 0, pnl: 0.52, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  {
    id: 3, date: "2026-04-14", entryDate: "2026-04-14", holdingDays: 0,
    ticker: "ORCL", direction: "LONG",
    entryPrice: 164.37, exitPrice: 162.00, shares: 3, stopLoss: 0,
    riskAmount: 0, pnl: -7.13, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Choppy",
    mistakes: "", lessons: "", grade: "B",
  },
  // ── 04/14 multi-day: VTI bought 04/06, held 8 days ──
  {
    id: 4, date: "2026-04-14", entryDate: "2026-04-06", holdingDays: 8,
    ticker: "VTI", direction: "LONG",
    entryPrice: 324.18, exitPrice: 342.32, shares: 1.542, stopLoss: 0,
    riskAmount: 0, pnl: 27.98, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  // ── 04/13 same-day ──
  {
    id: 5, date: "2026-04-13", entryDate: "2026-04-13", holdingDays: 0,
    ticker: "USO", direction: "LONG",
    entryPrice: 132.00, exitPrice: 132.52, shares: 3.787, stopLoss: 0,
    riskAmount: 0, pnl: 2.03, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  // ── 04/10 same-day ──
  {
    id: 6, date: "2026-04-10", entryDate: "2026-04-10", holdingDays: 0,
    ticker: "TSM", direction: "LONG",
    entryPrice: 377.06, exitPrice: 375.48, shares: 1.326, stopLoss: 0,
    riskAmount: 0, pnl: -2.10, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Choppy",
    mistakes: "", lessons: "", grade: "B",
  },
  // ── 04/09 same-day ──
  {
    id: 7, date: "2026-04-09", entryDate: "2026-04-09", holdingDays: 0,
    ticker: "USO", direction: "LONG",
    entryPrice: 128.77, exitPrice: 129.02, shares: 7.764, stopLoss: 0,
    riskAmount: 0, pnl: 2.00, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  // ── 04/08 multi-day closes: MU/LULU/META/CHWY bought ~03/30 ──
  {
    id: 8, date: "2026-04-08", entryDate: "2026-03-30", holdingDays: 9,
    ticker: "MU", direction: "LONG",
    entryPrice: 378.38, exitPrice: 415.49, shares: 1.347, stopLoss: 0,
    riskAmount: 0, pnl: 49.99, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  {
    id: 9, date: "2026-04-08", entryDate: "2026-03-30", holdingDays: 9,
    ticker: "LULU", direction: "LONG",
    entryPrice: 147.16, exitPrice: 161.24, shares: 0.013, stopLoss: 0,
    riskAmount: 0, pnl: 0.19, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  {
    id: 10, date: "2026-04-08", entryDate: "2026-03-30", holdingDays: 9,
    ticker: "META", direction: "LONG",
    entryPrice: 538.77, exitPrice: 603.57, shares: 0.003, stopLoss: 0,
    riskAmount: 0, pnl: 0.19, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
  {
    id: 11, date: "2026-04-08", entryDate: "2026-03-30", holdingDays: 9,
    ticker: "CHWY", direction: "LONG",
    entryPrice: 26.38, exitPrice: 26.72, shares: 0.075, stopLoss: 0,
    riskAmount: 0, pnl: 0.02, rMultiple: 0, setup: "Other",
    entryReason: "", exitReason: "", emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  },
];

const DEFAULT_MEMOS = [
  {
    id: 1, ticker: "VTI",
    title: "Core Position: Vanguard Total Stock Market ETF",
    date: "2025-03-15",
    thesis: "Passive core allocation providing broad US equity exposure. Low expense ratio (0.03%) ensures minimal drag on returns. Serves as the benchmark-tracking foundation of the portfolio while individual stock picks in the active sleeve attempt to generate alpha.",
    status: "Active",
  },
];

/* ── helpers ── */
const fmt = (n) => n?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "0.00";
const fmtPct = (n) => (n >= 0 ? "+" : "") + n?.toFixed(2) + "%";
const fmtUSD = (n) => "$" + fmt(n);

function calcPortfolioMetrics(holdings) {
  let totalValue = 0, totalCost = 0;
  holdings.forEach(h => { totalValue += h.shares * h.currentPrice; totalCost += h.shares * h.costBasis; });
  const totalPL = totalValue - totalCost;
  const totalPLPct = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
  return { totalValue, totalCost, totalPL, totalPLPct };
}

function getSectorData(holdings) {
  const map = {};
  holdings.forEach(h => { const val = h.shares * h.currentPrice; map[h.sector] = (map[h.sector] || 0) + val; });
  return Object.entries(map).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
}

const avgPE = (holdings) => {
  const vals = holdings.filter(h => h.pe).map(h => h.pe);
  return vals.length ? (vals.reduce((a,b) => a + b, 0) / vals.length).toFixed(1) : "N/A";
};

/* ── daytrading helpers ── */
function calcDaytradeMetrics(entries) {
  if (!entries.length) return { winRate: 0, profitFactor: 0, expectancy: 0, avgR: 0, maxDrawdown: 0, totalPnl: 0, wins: 0, losses: 0 };
  const winners = entries.filter(e => e.pnl > 0);
  const losers  = entries.filter(e => e.pnl < 0);
  const winRate = winners.length / entries.length;
  const grossProfit = winners.reduce((s, e) => s + e.pnl, 0);
  const grossLoss   = Math.abs(losers.reduce((s, e) => s + e.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0;
  const avgWin = winners.length > 0 ? grossProfit / winners.length : 0;
  const avgLoss = losers.length > 0 ? grossLoss / losers.length : 0;
  const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
  const avgR = entries.reduce((s, e) => s + (e.rMultiple || 0), 0) / entries.length;
  let peak = 0, maxDD = 0, cumPnl = 0;
  [...entries].sort((a, b) => a.date.localeCompare(b.date)).forEach(e => {
    cumPnl += e.pnl;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  });
  return { winRate, profitFactor, expectancy, avgR, maxDrawdown: maxDD, totalPnl: cumPnl, wins: winners.length, losses: losers.length };
}

function getCumPnlData(entries) {
  let cum = 0;
  return [...entries].sort((a, b) => a.date.localeCompare(b.date)).map(e => {
    cum += e.pnl;
    return { date: e.date, cumPnl: +cum.toFixed(2), pnl: +e.pnl.toFixed(2) };
  });
}

function getRMultipleData(entries) {
  const buckets = [
    { name: "< -2R", min: -Infinity, max: -2 },
    { name: "-2 to -1R", min: -2, max: -1 },
    { name: "-1 to 0R", min: -1, max: 0 },
    { name: "0 to 1R", min: 0, max: 1 },
    { name: "1 to 2R", min: 1, max: 2 },
    { name: "> 2R", min: 2, max: Infinity },
  ].map(b => ({ ...b, count: 0 }));
  entries.forEach(e => {
    const r = e.rMultiple || 0;
    const b = buckets.find(b => r >= b.min && r < b.max) || buckets[buckets.length - 1];
    b.count++;
  });
  return buckets.map(b => ({ name: b.name, count: b.count, positive: b.min >= 0 }));
}

/* ── shared UI ── */
function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.white, borderRadius: 14, border: `1px solid ${COLORS.gray200}`, padding: "24px", ...style }}>
      {children}
    </div>
  );
}

function MetricCard({ label, value, sub, color }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 12, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.primary, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: COLORS.gray500, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

/* ── portfolio components ── */
function SectorPie({ data }) {
  if (!data.length) return <div style={{ color: COLORS.gray400, textAlign: "center", padding: 40 }}>No holdings to display</div>;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={110} dataKey="value" stroke={COLORS.white} strokeWidth={3}>
          {data.map((_, i) => <Cell key={i} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [fmtUSD(v) + ` (${((v/total)*100).toFixed(1)}%)`, "Value"]} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.gray200}`, fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function HoldingsTable({ holdings, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.gray200}` }}>
            {["Ticker","Shares","Cost Basis","Current","Mkt Value","P/L","P/L %","Sector",""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: COLORS.gray500, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {holdings.map((h, i) => {
            const mv = h.shares * h.currentPrice;
            const pl = mv - (h.shares * h.costBasis);
            const plPct = h.costBasis > 0 ? (pl / (h.shares * h.costBasis)) * 100 : 0;
            const plColor = pl >= 0 ? COLORS.green : COLORS.red;
            return (
              <tr key={i} style={{ borderBottom: `1px solid ${COLORS.gray200}` }}
                  onMouseEnter={e => e.currentTarget.style.background = COLORS.accentFaint}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "12px", fontWeight: 700, color: COLORS.primary }}>{h.ticker}</td>
                <td style={{ padding: "12px" }}>{h.shares}</td>
                <td style={{ padding: "12px" }}>{fmtUSD(h.costBasis)}</td>
                <td style={{ padding: "12px" }}>{fmtUSD(h.currentPrice)}</td>
                <td style={{ padding: "12px", fontWeight: 600 }}>{fmtUSD(mv)}</td>
                <td style={{ padding: "12px", color: plColor, fontWeight: 600 }}>{fmtUSD(pl)}</td>
                <td style={{ padding: "12px", color: plColor, fontWeight: 600 }}>{fmtPct(plPct)}</td>
                <td style={{ padding: "12px", color: COLORS.gray500 }}>{h.sector}</td>
                <td style={{ padding: "12px" }}>
                  <button onClick={() => onDelete(i)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>×</button>
                </td>
              </tr>
            );
          })}
          {!holdings.length && <tr><td colSpan={9} style={{ padding: 30, textAlign: "center", color: COLORS.gray400 }}>No holdings yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TradesTable({ trades, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.gray200}` }}>
            {["Date","Action","Ticker","Shares","Price","Total","Rationale",""].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: COLORS.gray500, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.slice().sort((a, b) => b.date.localeCompare(a.date)).map((t, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${COLORS.gray200}` }}
                onMouseEnter={e => e.currentTarget.style.background = COLORS.accentFaint}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <td style={{ padding: "12px", color: COLORS.gray600 }}>{t.date}</td>
              <td style={{ padding: "12px" }}>
                <span style={{ padding: "3px 10px", borderRadius: 6, fontWeight: 700, fontSize: 12, background: t.action === "BUY" ? COLORS.greenBg : COLORS.redBg, color: t.action === "BUY" ? COLORS.green : COLORS.red }}>{t.action}</span>
              </td>
              <td style={{ padding: "12px", fontWeight: 700, color: COLORS.primary }}>{t.ticker}</td>
              <td style={{ padding: "12px" }}>{t.shares}</td>
              <td style={{ padding: "12px" }}>{fmtUSD(t.price)}</td>
              <td style={{ padding: "12px", fontWeight: 600 }}>{fmtUSD(t.shares * t.price)}</td>
              <td style={{ padding: "12px", color: COLORS.gray600, fontStyle: "italic", maxWidth: 250 }}>{t.rationale || "—"}</td>
              <td style={{ padding: "12px" }}>
                <button onClick={() => onDelete(i)} style={{ background: "none", border: "none", color: COLORS.red, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>×</button>
              </td>
            </tr>
          ))}
          {!trades.length && <tr><td colSpan={8} style={{ padding: 30, textAlign: "center", color: COLORS.gray400 }}>No trades logged yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function AddHoldingForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ ticker: "", shares: "", costBasis: "", currentPrice: "", sector: "Technology", pe: "" });
  const sectors = ["Broad Market","Technology","Healthcare","Financials","Consumer Discretionary","Consumer Staples","Energy","Industrials","Materials","Utilities","Real Estate","Communication Services"];
  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = () => {
    if (!form.ticker || !form.shares || !form.costBasis || !form.currentPrice) return;
    onAdd({ ticker: form.ticker.toUpperCase(), shares: +form.shares, costBasis: +form.costBasis, currentPrice: +form.currentPrice, sector: form.sector, pe: form.pe ? +form.pe : null });
    onClose();
  };
  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.gray500, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 440, maxHeight: "90vh", overflow: "auto" }}>
        <h3 style={{ margin: "0 0 20px", color: COLORS.primary, fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif" }}>Add Holding</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div><label style={labelStyle}>Ticker</label><input style={inputStyle} value={form.ticker} onChange={handle("ticker")} placeholder="e.g. AAPL" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Shares</label><input style={inputStyle} type="number" value={form.shares} onChange={handle("shares")} /></div>
            <div><label style={labelStyle}>Cost Basis</label><input style={inputStyle} type="number" step="0.01" value={form.costBasis} onChange={handle("costBasis")} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Current Price</label><input style={inputStyle} type="number" step="0.01" value={form.currentPrice} onChange={handle("currentPrice")} /></div>
            <div><label style={labelStyle}>P/E Ratio</label><input style={inputStyle} type="number" step="0.1" value={form.pe} onChange={handle("pe")} placeholder="Optional" /></div>
          </div>
          <div><label style={labelStyle}>Sector</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.sector} onChange={handle("sector")}>
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
          <button onClick={submit} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Add Position</button>
        </div>
      </div>
    </div>
  );
}

function AddTradeForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0,10), action: "BUY", ticker: "", shares: "", price: "", rationale: "" });
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.gray500, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 };

  const submitManual = () => {
    if (!form.ticker || !form.shares || !form.price) return;
    onAdd([{ date: form.date, action: form.action, ticker: form.ticker.toUpperCase(), shares: +form.shares, price: +form.price, rationale: form.rationale }]);
    onClose();
  };

  const parsePaste = () => {
    if (!pasteText.trim()) return;
    const lines = pasteText.trim().split("\n").filter(l => l.trim());
    const trades = [];
    for (const line of lines) {
      const parts = line.split(/\t|,|  +/).map(s => s.trim()).filter(Boolean);
      if (parts.length >= 4) {
        const action = parts[1]?.toUpperCase().includes("SELL") ? "SELL" : parts[1]?.toUpperCase().includes("BUY") ? "BUY" : null;
        const ticker = parts[2]?.toUpperCase();
        const shares = parseFloat(parts[3]);
        const price = parseFloat(parts[4]) || 0;
        if (action && ticker && !isNaN(shares)) trades.push({ date: parts[0], action, ticker, shares, price, rationale: "" });
      }
    }
    if (trades.length > 0) { onAdd(trades); onClose(); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 500, maxHeight: "90vh", overflow: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: COLORS.primary, fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif" }}>Log Trade</h3>
          <div style={{ display: "flex", gap: 4, background: COLORS.gray100, borderRadius: 8, padding: 3 }}>
            <button onClick={() => setPasteMode(false)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: !pasteMode ? COLORS.accent : "transparent", color: !pasteMode ? COLORS.white : COLORS.gray500, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Manual</button>
            <button onClick={() => setPasteMode(true)} style={{ padding: "6px 14px", borderRadius: 6, border: "none", background: pasteMode ? COLORS.accent : "transparent", color: pasteMode ? COLORS.white : COLORS.gray500, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Paste from Fidelity</button>
          </div>
        </div>
        {pasteMode ? (
          <div>
            <p style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 12 }}>Paste your Fidelity activity. Expected: Date, Action, Ticker, Shares, Price (tab or comma separated)</p>
            <textarea style={{ ...inputStyle, height: 200, resize: "vertical", fontFamily: "monospace", fontSize: 12 }} value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder={"03/15/2025\tBUY\tVTI\t10\t245.00"} />
            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
              <button onClick={parsePaste} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Import Trades</button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label style={labelStyle}>Date</label><input style={inputStyle} type="date" value={form.date} onChange={handle("date")} /></div>
                <div><label style={labelStyle}>Action</label>
                  <select style={{ ...inputStyle, cursor: "pointer" }} value={form.action} onChange={handle("action")}>
                    <option value="BUY">BUY</option><option value="SELL">SELL</option>
                  </select>
                </div>
              </div>
              <div><label style={labelStyle}>Ticker</label><input style={inputStyle} value={form.ticker} onChange={handle("ticker")} placeholder="e.g. AAPL" /></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div><label style={labelStyle}>Shares</label><input style={inputStyle} type="number" value={form.shares} onChange={handle("shares")} /></div>
                <div><label style={labelStyle}>Price</label><input style={inputStyle} type="number" step="0.01" value={form.price} onChange={handle("price")} /></div>
              </div>
              <div><label style={labelStyle}>Rationale</label><input style={inputStyle} value={form.rationale} onChange={handle("rationale")} placeholder="Why this trade?" /></div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
              <button onClick={submitManual} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Log Trade</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Memo components ── */
function MemoCard({ memo, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card style={{ marginBottom: 14, cursor: "pointer", border: `1px solid ${expanded ? COLORS.accentLight : COLORS.gray200}` }}>
      <div onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontWeight: 800, color: COLORS.accent, fontSize: 14, background: COLORS.accentPale, padding: "3px 10px", borderRadius: 6 }}>{memo.ticker}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6, background: memo.status === "Active" ? COLORS.greenBg : memo.status === "Closed" ? COLORS.redBg : COLORS.accentFaint, color: memo.status === "Active" ? COLORS.green : memo.status === "Closed" ? COLORS.red : COLORS.accent }}>{memo.status}</span>
            </div>
            <h4 style={{ margin: 0, fontSize: 16, color: COLORS.primary, fontFamily: "'Instrument Serif', Georgia, serif" }}>{memo.title}</h4>
          </div>
          <div style={{ fontSize: 13, color: COLORS.gray400 }}>{memo.date}</div>
        </div>
        {expanded && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${COLORS.gray200}` }}>
            <p style={{ margin: 0, color: COLORS.gray600, lineHeight: 1.7, fontSize: 14, whiteSpace: "pre-wrap" }}>{memo.thesis}</p>
            <button onClick={(e) => { e.stopPropagation(); onDelete(memo.id); }} style={{ marginTop: 14, padding: "6px 14px", borderRadius: 6, border: `1px solid ${COLORS.red}`, background: "transparent", color: COLORS.red, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Delete Memo</button>
          </div>
        )}
      </div>
    </Card>
  );
}

function AddMemoForm({ onAdd, onClose }) {
  const [form, setForm] = useState({ ticker: "", title: "", thesis: "", status: "Active" });
  const handle = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.gray500, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 };
  const submit = () => {
    if (!form.ticker || !form.title || !form.thesis) return;
    onAdd({ id: Date.now(), ticker: form.ticker.toUpperCase(), title: form.title, thesis: form.thesis, date: new Date().toISOString().slice(0,10), status: form.status });
    onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 540, maxHeight: "90vh", overflow: "auto" }}>
        <h3 style={{ margin: "0 0 20px", color: COLORS.primary, fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif" }}>New Investment Memo</h3>
        <div style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Ticker</label><input style={inputStyle} value={form.ticker} onChange={handle("ticker")} placeholder="e.g. MSFT" /></div>
            <div><label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, cursor: "pointer" }} value={form.status} onChange={handle("status")}>
                <option value="Active">Active</option><option value="Watchlist">Watchlist</option><option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>Title</label><input style={inputStyle} value={form.title} onChange={handle("title")} placeholder="Investment thesis title" /></div>
          <div><label style={labelStyle}>Thesis</label><textarea style={{ ...inputStyle, height: 180, resize: "vertical" }} value={form.thesis} onChange={handle("thesis")} placeholder="Bull case, key risks, catalysts, valuation rationale..." /></div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
          <button onClick={submit} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Save Memo</button>
        </div>
      </div>
    </div>
  );
}

function PerfChart({ benchmarkData, range }) {
  if (!benchmarkData?.series?.length) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: COLORS.gray400 }}>Loading benchmark data...</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={benchmarkData.series}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.gray400 }} tickFormatter={v => { const d = new Date(v); return (d.getMonth()+1)+"/"+d.getDate(); }} interval={Math.max(1, Math.floor(benchmarkData.series.length / 8))} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.gray400 }} tickFormatter={v => v + "%"} />
        <Tooltip formatter={(v) => v?.toFixed(2) + "%"} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.gray200}`, fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="pctReturn" stroke={COLORS.gray400} strokeWidth={2} dot={false} strokeDasharray="6 3" name="S&P 500" connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ── Live data hooks ── */
function useLiveQuotes(holdings, enabled) {
  const [quotes, setQuotes] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = useCallback(async () => {
    const tickers = holdings.map(h => h.ticker).filter(Boolean);
    if (tickers.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?symbols=${tickers.join(",")}`);
      if (res.ok) { const data = await res.json(); setQuotes(data.quotes || {}); setLastUpdated(new Date()); }
    } catch (e) { console.error("Quote fetch error:", e); }
    setLoading(false);
  }, [holdings]);

  useEffect(() => {
    if (!enabled) return;
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [fetchQuotes, enabled]);

  return { quotes, lastUpdated, loading, refetch: fetchQuotes };
}

function useBenchmark(range) {
  const [data, setData] = useState(null);
  useEffect(() => {
    async function fetchBenchmark() {
      try {
        const res = await fetch(`/api/benchmark?range=${range}`);
        if (res.ok) setData(await res.json());
      } catch (e) { console.error("Benchmark fetch error:", e); }
    }
    fetchBenchmark();
  }, [range]);
  return data;
}

function applyLiveQuotes(holdings, quotes) {
  return holdings.map(h => {
    const q = quotes[h.ticker];
    if (q && q.price && !q.error) return { ...h, currentPrice: q.price, liveChange: q.changePct };
    return h;
  });
}

/* ════════════════════════════════════════════
   FIDELITY CSV IMPORT HELPERS
   ════════════════════════════════════════════ */

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === "," && !inQuotes) { result.push(current.trim()); current = ""; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function toISODate(dateStr) {
  // MM/DD/YYYY → YYYY-MM-DD
  const parts = dateStr.trim().split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[0].padStart(2,"0")}-${parts[1].padStart(2,"0")}`;
  return dateStr;
}

function parseFidelityCSV(text) {
  const lines = text.split("\n");
  let headerIdx = null;
  const rawTrades = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);

    if (!headerIdx && cols.some(c => c.trim() === "Run Date")) {
      headerIdx = {};
      cols.forEach((c, i) => { headerIdx[c.trim()] = i; });
      continue;
    }
    if (!headerIdx) continue;

    const action  = cols[headerIdx["Action"]] || "";
    const symbol  = (cols[headerIdx["Symbol"]] || "").trim();
    const price   = parseFloat(cols[headerIdx["Price ($)"]] || 0);
    const qty     = parseFloat(cols[headerIdx["Quantity"]] || 0);
    const amount  = parseFloat(cols[headerIdx["Amount ($)"]] || 0);
    const dateRaw = cols[headerIdx["Run Date"]] || "";

    if (!symbol || !action.includes("YOU")) continue;
    if (isNaN(price) || price === 0) continue;

    const isBuy  = action.includes("YOU BOUGHT");
    const isSell = action.includes("YOU SOLD");
    if (!isBuy && !isSell) continue;

    rawTrades.push({
      date: toISODate(dateRaw),
      symbol,
      type: isBuy ? "BUY" : "SELL",
      price: Math.abs(price),
      qty: Math.abs(qty),
      amount,
    });
  }

  // Sort chronologically so FIFO works correctly
  rawTrades.sort((a, b) => a.date.localeCompare(b.date));

  // FIFO matching: group by symbol, match sells against oldest buy lots
  const lotsBySymbol = {}; // symbol → [{date, price, qty, amount}]
  const entries = [];

  for (const t of rawTrades) {
    if (!lotsBySymbol[t.symbol]) lotsBySymbol[t.symbol] = [];
    const lots = lotsBySymbol[t.symbol];

    if (t.type === "BUY") {
      lots.push({ date: t.date, price: t.price, qty: t.qty, amount: t.amount });
    } else {
      // Match this sell against oldest lots (FIFO)
      let remaining = t.qty;
      let costBasis = 0;
      let proceeds = Math.abs(t.amount); // use Fidelity's net amount (fees already deducted)
      let entryDate = null;
      let matchedQty = 0;
      const usedAmounts = [];

      while (remaining > 0.0001 && lots.length > 0) {
        const lot = lots[0];
        const used = Math.min(lot.qty, remaining);
        const lotFrac = used / lot.qty;

        if (!entryDate) entryDate = lot.date;
        costBasis += used * lot.price;
        matchedQty += used;
        usedAmounts.push(lot.amount * lotFrac);

        lot.qty -= used;
        remaining -= used;
        if (lot.qty < 0.0001) lots.shift();
      }

      if (matchedQty < 0.0001 || !entryDate) continue; // no matching buy found in this export

      const avgEntry = costBasis / matchedQty;
      const avgExit  = t.price;
      // P/L = proceeds (from Fidelity amount) minus proportional cost
      const costFromAmounts = usedAmounts.reduce((s, a) => s + a, 0); // negative values
      const pnl = +(proceeds + costFromAmounts).toFixed(2); // proceeds positive, costs negative

      const holdingMs = new Date(t.date) - new Date(entryDate);
      const holdingDays = Math.max(0, Math.round(holdingMs / 86400000));

      entries.push({
        id: Date.now() + Math.random(),
        date: t.date,
        entryDate,
        holdingDays,
        ticker: t.symbol,
        direction: "LONG",
        entryPrice: +avgEntry.toFixed(2),
        exitPrice: +avgExit.toFixed(2),
        shares: +matchedQty.toFixed(3),
        stopLoss: 0, riskAmount: 0, pnl, rMultiple: 0,
        setup: "Other",
        entryReason: "", exitReason: "",
        emotion: "Calm", marketCondition: "Trending Up",
        mistakes: "", lessons: "", grade: "B",
      });
    }
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date));
}

function FidelityImportForm({ onImport, onClose }) {
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  const handleParse = () => {
    setError("");
    if (!csv.trim()) { setError("Paste your Fidelity CSV text first."); return; }
    const entries = parseFidelityCSV(csv);
    if (!entries.length) { setError("No same-day round-trip trades found. Make sure you pasted the full CSV including the header row."); return; }
    setPreview(entries);
  };

  const handleImport = () => { onImport(preview); onClose(); };

  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 680, maxHeight: "92vh", overflow: "auto" }}>
        <h3 style={{ margin: "0 0 8px", color: COLORS.primary, fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif" }}>Import from Fidelity CSV</h3>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.gray500 }}>
          In Fidelity: <strong>Accounts → History → Download</strong>. Open the CSV, select all, paste below.
          Only same-day buy+sell round trips are imported as daytrading entries.
        </p>

        {!preview ? (
          <>
            <textarea
              style={{ ...inputStyle, height: 240, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
              value={csv}
              onChange={e => setCsv(e.target.value)}
              placeholder={"Run Date,Account,Account Number,Action,Symbol,...\n04/14/2026,\"Individual\",\"Z39444051\",\"YOU BOUGHT PROSHARES ULTRAPRO QQQ (TQQQ) (Cash)\",TQQQ,..."}
            />
            {error && <div style={{ marginTop: 8, color: COLORS.red, fontSize: 13 }}>{error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
              <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
              <button onClick={handleParse} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Parse Trades</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 12, fontSize: 13, color: COLORS.green, fontWeight: 600 }}>
              Found {preview.length} round-trip trade{preview.length !== 1 ? "s" : ""}. Review before importing:
            </div>
            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${COLORS.gray200}` }}>
                    {["Date","Ticker","Dir","Avg Entry","Avg Exit","Shares","P/L"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: COLORS.gray500, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((e, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.gray200}` }}>
                      <td style={{ padding: "8px 10px", color: COLORS.gray600 }}>{e.date}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: COLORS.primary }}>{e.ticker}</td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, background: e.direction === "LONG" ? COLORS.greenBg : COLORS.redBg, color: e.direction === "LONG" ? COLORS.green : COLORS.red }}>{e.direction}</span>
                      </td>
                      <td style={{ padding: "8px 10px" }}>{fmtUSD(e.entryPrice)}</td>
                      <td style={{ padding: "8px 10px" }}>{fmtUSD(e.exitPrice)}</td>
                      <td style={{ padding: "8px 10px" }}>{e.shares}</td>
                      <td style={{ padding: "8px 10px", fontWeight: 700, color: e.pnl >= 0 ? COLORS.green : COLORS.red }}>
                        {e.pnl >= 0 ? "+" : ""}{fmtUSD(e.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 14px", background: COLORS.accentFaint, borderRadius: 8, fontSize: 12, color: COLORS.gray600, marginBottom: 16 }}>
              Stop loss, R-multiple, setup, emotions, and notes will be blank — click any entry after importing to fill them in.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setPreview(null)} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Back</button>
              <button onClick={handleImport} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.green, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Import {preview.length} Trade{preview.length !== 1 ? "s" : ""}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   DAYTRADING JOURNAL COMPONENTS
   ════════════════════════════════════════════ */

const GRADE_COLORS = { A: "#059669", B: "#65a30d", C: "#d97706", D: "#ea580c", F: "#dc2626" };
const EMOTION_COLORS = {
  Calm: COLORS.green, Confident: COLORS.accent, Anxious: COLORS.orange,
  Fearful: COLORS.red, Greedy: "#7c3aed", FOMO: "#db2777",
  Frustrated: "#ea580c", Euphoric: "#0891b2", Bored: COLORS.gray400,
};

function JournalEntryCard({ entry, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isWin = entry.pnl > 0;
  const pnlColor = isWin ? COLORS.green : COLORS.red;
  const rColor = (entry.rMultiple || 0) > 0 ? COLORS.green : COLORS.red;
  const gradeColor = GRADE_COLORS[entry.grade] || COLORS.gray500;
  const emotionColor = EMOTION_COLORS[entry.emotion] || COLORS.gray500;

  const labelStyle = { fontSize: 11, color: COLORS.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 };
  const valueStyle = { fontSize: 14, color: COLORS.gray700, lineHeight: 1.6 };

  return (
    <Card style={{ marginBottom: 12, border: `1px solid ${expanded ? COLORS.accentLight : COLORS.gray200}`, padding: "18px 24px" }}>
      {/* Compact header */}
      <div onClick={() => setExpanded(!expanded)} style={{ cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {/* Direction badge */}
          <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 800, background: entry.direction === "LONG" ? COLORS.greenBg : COLORS.redBg, color: entry.direction === "LONG" ? COLORS.green : COLORS.red }}>
            {entry.direction}
          </span>
          {/* Ticker */}
          <span style={{ fontWeight: 800, fontSize: 16, color: COLORS.primary }}>{entry.ticker}</span>
          {/* Date range / holding period */}
          <span style={{ fontSize: 13, color: COLORS.gray400 }}>
            {entry.holdingDays === 0
              ? entry.date + " · Day Trade"
              : (entry.entryDate || entry.date) + " → " + entry.date + ` · ${entry.holdingDays}d`}
          </span>
          {/* Setup */}
          <span style={{ fontSize: 12, color: COLORS.gray500, background: COLORS.gray100, padding: "2px 8px", borderRadius: 6 }}>{entry.setup}</span>
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Entry/Exit */}
          <span style={{ fontSize: 13, color: COLORS.gray500 }}>
            {fmtUSD(entry.entryPrice)} → {fmtUSD(entry.exitPrice)}
          </span>
          {/* Shares */}
          <span style={{ fontSize: 13, color: COLORS.gray500 }}>{entry.shares} sh</span>
          {/* P/L */}
          <span style={{ fontWeight: 700, fontSize: 15, color: pnlColor, minWidth: 80, textAlign: "right" }}>
            {entry.pnl >= 0 ? "+" : ""}{fmtUSD(entry.pnl)}
          </span>
          {/* R-multiple */}
          <span style={{ fontWeight: 700, fontSize: 14, color: rColor, minWidth: 54, textAlign: "right" }}>
            {(entry.rMultiple || 0) >= 0 ? "+" : ""}{(entry.rMultiple || 0).toFixed(2)}R
          </span>
          {/* Grade */}
          <span style={{ fontWeight: 800, fontSize: 14, color: gradeColor, width: 24, textAlign: "center" }}>{entry.grade}</span>
          {/* Emotion dot */}
          <span title={entry.emotion} style={{ width: 10, height: 10, borderRadius: "50%", background: emotionColor, display: "inline-block" }} />
          {/* Expand chevron */}
          <span style={{ color: COLORS.gray400, fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: `1px solid ${COLORS.gray200}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 18 }}>
            <div>
              <div style={labelStyle}>Entry Reasoning</div>
              <div style={valueStyle}>{entry.entryReason || "—"}</div>
            </div>
            <div>
              <div style={labelStyle}>Exit Reasoning</div>
              <div style={valueStyle}>{entry.exitReason || "—"}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 18 }}>
            <div>
              <div style={labelStyle}>Emotion</div>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: emotionColor + "22", color: emotionColor }}>{entry.emotion}</span>
            </div>
            <div>
              <div style={labelStyle}>Market Condition</div>
              <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: COLORS.gray100, color: COLORS.gray700 }}>{entry.marketCondition}</span>
            </div>
            <div>
              <div style={labelStyle}>Risk Amount</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray700 }}>{fmtUSD(entry.riskAmount)}</div>
            </div>
            <div>
              <div style={labelStyle}>Stop Loss</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.gray700 }}>{fmtUSD(entry.stopLoss)}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={labelStyle}>Mistakes</div>
              <div style={{ ...valueStyle, color: entry.mistakes === "None" ? COLORS.green : COLORS.gray600 }}>{entry.mistakes || "—"}</div>
            </div>
            <div>
              <div style={labelStyle}>Lessons Learned</div>
              <div style={valueStyle}>{entry.lessons || "—"}</div>
            </div>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => onDelete(entry.id)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${COLORS.red}`, background: "transparent", color: COLORS.red, cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Delete Entry</button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AddJournalEntryForm({ onAdd, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    entryDate: today, date: today, ticker: "", direction: "LONG",
    entryPrice: "", exitPrice: "", shares: "", stopLoss: "",
    setup: "Bull Flag", entryReason: "", exitReason: "",
    emotion: "Calm", marketCondition: "Trending Up",
    mistakes: "", lessons: "", grade: "B",
  });

  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const calcPnl = () => {
    const entry = parseFloat(form.entryPrice) || 0;
    const exit = parseFloat(form.exitPrice) || 0;
    const shares = parseFloat(form.shares) || 0;
    const dir = form.direction === "SHORT" ? -1 : 1;
    return (exit - entry) * shares * dir;
  };

  const calcRisk = () => {
    const entry = parseFloat(form.entryPrice) || 0;
    const stop = parseFloat(form.stopLoss) || 0;
    const shares = parseFloat(form.shares) || 0;
    return Math.abs(entry - stop) * shares;
  };

  const pnl = calcPnl();
  const riskAmount = calcRisk();
  const rMultiple = riskAmount > 0 ? pnl / riskAmount : 0;

  const submit = () => {
    if (!form.ticker || !form.entryPrice || !form.exitPrice || !form.shares) return;
    const entryDate = form.entryDate || form.date;
    const holdingMs = new Date(form.date) - new Date(entryDate);
    const holdingDays = Math.max(0, Math.round(holdingMs / 86400000));
    onAdd({
      id: Date.now(),
      date: form.date,
      entryDate,
      holdingDays,
      ticker: form.ticker.toUpperCase(),
      direction: form.direction,
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: parseFloat(form.exitPrice),
      shares: parseFloat(form.shares),
      stopLoss: parseFloat(form.stopLoss) || 0,
      riskAmount: +riskAmount.toFixed(2),
      pnl: +pnl.toFixed(2),
      rMultiple: +rMultiple.toFixed(2),
      setup: form.setup,
      entryReason: form.entryReason,
      exitReason: form.exitReason,
      emotion: form.emotion,
      marketCondition: form.marketCondition,
      mistakes: form.mistakes,
      lessons: form.lessons,
      grade: form.grade,
    });
    onClose();
  };

  const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.gray200}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: COLORS.gray500, marginBottom: 4, display: "block", textTransform: "uppercase", letterSpacing: 0.5 };
  const taStyle = { ...inputStyle, height: 80, resize: "vertical" };

  const pnlColor = pnl >= 0 ? COLORS.green : COLORS.red;
  const rColor = rMultiple >= 0 ? COLORS.green : COLORS.red;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: COLORS.white, borderRadius: 16, padding: 32, width: 640, maxHeight: "92vh", overflow: "auto" }}>
        <h3 style={{ margin: "0 0 20px", color: COLORS.primary, fontSize: 20, fontFamily: "'Instrument Serif', Georgia, serif" }}>Log Journal Entry</h3>

        {/* Row 1: entry date, exit date, ticker, direction */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label style={labelStyle}>Entry Date</label><input style={inputStyle} type="date" value={form.entryDate} onChange={handle("entryDate")} /></div>
          <div><label style={labelStyle}>Exit Date</label><input style={inputStyle} type="date" value={form.date} onChange={handle("date")} /></div>
          <div><label style={labelStyle}>Ticker</label><input style={inputStyle} value={form.ticker} onChange={handle("ticker")} placeholder="SPY" /></div>
          <div><label style={labelStyle}>Direction</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.direction} onChange={handle("direction")}>
              <option value="LONG">LONG</option><option value="SHORT">SHORT</option>
            </select>
          </div>
        </div>

        {/* Row 2: entry, exit, shares, stop */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label style={labelStyle}>Entry Price</label><input style={inputStyle} type="number" step="0.01" value={form.entryPrice} onChange={handle("entryPrice")} placeholder="0.00" /></div>
          <div><label style={labelStyle}>Exit Price</label><input style={inputStyle} type="number" step="0.01" value={form.exitPrice} onChange={handle("exitPrice")} placeholder="0.00" /></div>
          <div><label style={labelStyle}>Shares / Qty</label><input style={inputStyle} type="number" value={form.shares} onChange={handle("shares")} placeholder="0" /></div>
          <div><label style={labelStyle}>Stop Loss</label><input style={inputStyle} type="number" step="0.01" value={form.stopLoss} onChange={handle("stopLoss")} placeholder="0.00" /></div>
        </div>

        {/* Auto-calculated preview */}
        {(form.entryPrice && form.exitPrice && form.shares) && (
          <div style={{ display: "flex", gap: 24, padding: "12px 16px", background: COLORS.gray100, borderRadius: 10, marginBottom: 14 }}>
            <div><span style={{ fontSize: 11, color: COLORS.gray500, fontWeight: 600 }}>P/L </span><span style={{ fontWeight: 700, color: pnlColor }}>{pnl >= 0 ? "+" : ""}{fmtUSD(pnl)}</span></div>
            <div><span style={{ fontSize: 11, color: COLORS.gray500, fontWeight: 600 }}>Risk </span><span style={{ fontWeight: 700, color: COLORS.gray700 }}>{fmtUSD(riskAmount)}</span></div>
            <div><span style={{ fontSize: 11, color: COLORS.gray500, fontWeight: 600 }}>R-Multiple </span><span style={{ fontWeight: 700, color: rColor }}>{rMultiple >= 0 ? "+" : ""}{rMultiple.toFixed(2)}R</span></div>
          </div>
        )}

        {/* Row 3: setup, emotion, market, grade */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label style={labelStyle}>Setup</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.setup} onChange={handle("setup")}>
              {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Emotion</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.emotion} onChange={handle("emotion")}>
              {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Market</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.marketCondition} onChange={handle("marketCondition")}>
              {MARKET_CONDITIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Grade</label>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.grade} onChange={handle("grade")}>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        {/* Text areas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><label style={labelStyle}>Entry Reasoning</label><textarea style={taStyle} value={form.entryReason} onChange={handle("entryReason")} placeholder="Why did you take this trade?" /></div>
          <div><label style={labelStyle}>Exit Reasoning</label><textarea style={taStyle} value={form.exitReason} onChange={handle("exitReason")} placeholder="Why did you exit here?" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div><label style={labelStyle}>Mistakes</label><textarea style={taStyle} value={form.mistakes} onChange={handle("mistakes")} placeholder="What did you do wrong?" /></div>
          <div><label style={labelStyle}>Lessons Learned</label><textarea style={taStyle} value={form.lessons} onChange={handle("lessons")} placeholder="What will you do differently?" /></div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${COLORS.gray200}`, background: COLORS.white, cursor: "pointer", fontWeight: 600, color: COLORS.gray600 }}>Cancel</button>
          <button onClick={submit} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: COLORS.accent, color: COLORS.white, cursor: "pointer", fontWeight: 600 }}>Save Entry</button>
        </div>
      </div>
    </div>
  );
}

function CumPnlChart({ data }) {
  if (!data.length) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 240, color: COLORS.gray400 }}>No trades yet</div>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.gray400 }} tickFormatter={v => { const d = new Date(v + "T00:00:00"); return (d.getMonth()+1)+"/"+d.getDate(); }} interval={Math.max(0, Math.floor(data.length / 7) - 1)} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.gray400 }} tickFormatter={v => "$" + v} />
        <Tooltip formatter={(v, n) => [fmtUSD(v), n === "cumPnl" ? "Cumulative P/L" : "Trade P/L"]} labelFormatter={v => v} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.gray200}`, fontSize: 13 }} />
        <ReferenceLine y={0} stroke={COLORS.gray300} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="cumPnl" stroke={COLORS.accent} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.accent }} name="cumPnl" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function RMultipleChart({ data }) {
  if (!data.every(d => d.count === 0) === false) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: COLORS.gray400 }}>No trades yet</div>;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.gray200} vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: COLORS.gray500 }} />
        <YAxis tick={{ fontSize: 11, fill: COLORS.gray400 }} allowDecimals={false} />
        <Tooltip formatter={(v) => [v + " trades", "Count"]} contentStyle={{ borderRadius: 8, border: `1px solid ${COLORS.gray200}`, fontSize: 13 }} />
        <Bar dataKey="count" radius={[4,4,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={d.positive ? COLORS.green : COLORS.red} fillOpacity={0.8} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DaytradingTab({ journal, onAddEntry, onDeleteEntry, onImportEntries }) {
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filterGrade, setFilterGrade] = useState("All");
  const [filterDirection, setFilterDirection] = useState("All");

  const metrics = calcDaytradeMetrics(journal);
  const cumPnlData = getCumPnlData(journal);
  const rMultipleData = getRMultipleData(journal);

  const filtered = [...journal]
    .filter(e => filterGrade === "All" || e.grade === filterGrade)
    .filter(e => filterDirection === "All" || e.direction === filterDirection)
    .sort((a, b) => b.date.localeCompare(a.date));

  const actionBtn = {
    padding: "10px 20px", borderRadius: 10, border: `2px solid ${COLORS.accent}`,
    background: COLORS.accent, color: COLORS.white, cursor: "pointer",
    fontWeight: 700, fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const filterBtn = (active) => ({
    padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700,
    cursor: "pointer", background: active ? COLORS.accent : "transparent",
    color: active ? COLORS.white : COLORS.gray500,
  });

  const profitFactorDisplay = metrics.profitFactor === 999 ? "∞" : metrics.profitFactor.toFixed(2);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: COLORS.primary, fontSize: 28, fontFamily: "'Instrument Serif', Georgia, serif" }}>Short-term Holdings Journal</h2>
          <p style={{ margin: "6px 0 0", color: COLORS.gray500, fontSize: 14 }}>
            {journal.length} closed positions · {metrics.wins}W / {metrics.losses}L · all held under 1 year
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setShowImport(true)} style={{ ...actionBtn, background: "transparent" }}>Import Fidelity CSV</button>
          <button onClick={() => setShowAddEntry(true)} style={actionBtn}>+ Log Trade</button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <MetricCard
            label="Win Rate"
            value={journal.length ? (metrics.winRate * 100).toFixed(0) + "%" : "—"}
            color={metrics.winRate >= 0.5 ? COLORS.green : COLORS.red}
          />
        </Card>
        <Card>
          <MetricCard
            label="Profit Factor"
            value={journal.length ? profitFactorDisplay : "—"}
            color={metrics.profitFactor >= 1.5 ? COLORS.green : metrics.profitFactor >= 1 ? COLORS.orange : COLORS.red}
          />
        </Card>
        <Card>
          <MetricCard
            label="Expectancy"
            value={journal.length ? (metrics.expectancy >= 0 ? "+" : "") + fmtUSD(metrics.expectancy) : "—"}
            color={metrics.expectancy >= 0 ? COLORS.green : COLORS.red}
          />
        </Card>
        <Card>
          <MetricCard
            label="Avg R-Multiple"
            value={journal.length ? (metrics.avgR >= 0 ? "+" : "") + metrics.avgR.toFixed(2) + "R" : "—"}
            color={metrics.avgR >= 0 ? COLORS.green : COLORS.red}
          />
        </Card>
        <Card>
          <MetricCard
            label="Max Drawdown"
            value={journal.length ? fmtUSD(metrics.maxDrawdown) : "—"}
            color={metrics.maxDrawdown > 0 ? COLORS.red : COLORS.gray500}
          />
        </Card>
        <Card>
          <MetricCard
            label="Total P/L"
            value={journal.length ? (metrics.totalPnl >= 0 ? "+" : "") + fmtUSD(metrics.totalPnl) : "—"}
            color={metrics.totalPnl >= 0 ? COLORS.green : COLORS.red}
          />
        </Card>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>Cumulative P/L</h3>
          <CumPnlChart data={cumPnlData} />
        </Card>
        <Card>
          <h3 style={{ margin: "0 0 16px", color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>R-Multiple Distribution</h3>
          <RMultipleChart data={rMultipleData} />
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.gray500 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.green }} /> Winners
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.gray500 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.red }} /> Losers
            </div>
          </div>
        </Card>
      </div>

      {/* Journal Entries */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>Trade Journal</h3>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 3, background: COLORS.gray100, borderRadius: 8, padding: 3 }}>
              {["All","LONG","SHORT"].map(d => (
                <button key={d} onClick={() => setFilterDirection(d)} style={filterBtn(filterDirection === d)}>{d}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 3, background: COLORS.gray100, borderRadius: 8, padding: 3 }}>
              {["All",...GRADES].map(g => (
                <button key={g} onClick={() => setFilterGrade(g)} style={{ ...filterBtn(filterGrade === g), color: filterGrade === g ? COLORS.white : (g === "All" ? COLORS.gray500 : GRADE_COLORS[g]) }}>{g}</button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 0" }}>
          {filtered.map(entry => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={onDeleteEntry} />
          ))}
          {!filtered.length && (
            <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.gray400 }}>
              {journal.length ? "No trades match the current filter." : "No trades logged yet. Click '+ Log Trade' to get started."}
            </div>
          )}
        </div>
      </Card>

      {showAddEntry && (
        <AddJournalEntryForm
          onAdd={(entry) => { onAddEntry(entry); setShowAddEntry(false); }}
          onClose={() => setShowAddEntry(false)}
        />
      )}
      {showImport && (
        <FidelityImportForm
          onImport={(entries) => { onImportEntries(entries); setShowImport(false); }}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
export default function PortfolioDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [portfolios, setPortfolios] = useState(DEFAULT_PORTFOLIO);
  const [memos, setMemos] = useState(DEFAULT_MEMOS);
  const [journal, setJournal] = useState(DEFAULT_JOURNAL);
  const [showAddHolding, setShowAddHolding] = useState(false);
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showAddMemo, setShowAddMemo] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [benchmarkRange, setBenchmarkRange] = useState("3mo");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ts8-portfolio-data");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.portfolios) setPortfolios(parsed.portfolios);
        if (parsed.memos) setMemos(parsed.memos);
        if (parsed.journal) setJournal(parsed.journal);
      }
    } catch (e) { /* first load */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("ts8-portfolio-data", JSON.stringify({ portfolios, memos, journal }));
    } catch (e) { console.error("Save error:", e); }
  }, [portfolios, memos, journal, loaded]);

  const currentPortfolioKey = activeTab === 0 ? "TS-8 Fund" : "Daytrading";
  const portfolio = portfolios[currentPortfolioKey] || { accountValue: 0, holdings: [], trades: [] };

  const { quotes, lastUpdated, loading: quotesLoading, refetch } = useLiveQuotes(portfolio.holdings, loaded && activeTab === 0);
  const benchmarkData = useBenchmark(benchmarkRange);

  const liveHoldings = applyLiveQuotes(portfolio.holdings, quotes);
  const metrics = calcPortfolioMetrics(liveHoldings);
  const sectorData = getSectorData(liveHoldings);

  const updatePortfolio = (key, updater) => setPortfolios(prev => ({ ...prev, [key]: updater(prev[key]) }));
  const addHolding = (h) => updatePortfolio(currentPortfolioKey, p => ({ ...p, holdings: [...p.holdings, h] }));
  const deleteHolding = (i) => updatePortfolio(currentPortfolioKey, p => ({ ...p, holdings: p.holdings.filter((_, j) => j !== i) }));
  const addTrades = (ts) => updatePortfolio(currentPortfolioKey, p => ({ ...p, trades: [...p.trades, ...ts] }));
  const deleteTrade = (i) => {
    const sorted = portfolio.trades.slice().sort((a, b) => b.date.localeCompare(a.date));
    const toRemove = sorted[i];
    updatePortfolio(currentPortfolioKey, p => {
      const idx = p.trades.indexOf(toRemove);
      return { ...p, trades: p.trades.filter((_, j) => j !== idx) };
    });
  };
  const addMemo = (m) => setMemos(prev => [m, ...prev]);
  const deleteMemo = (id) => setMemos(prev => prev.filter(m => m.id !== id));
  const addJournalEntry = (e) => setJournal(prev => [e, ...prev]);
  const deleteJournalEntry = (id) => setJournal(prev => prev.filter(e => e.id !== id));
  const importJournalEntries = (entries) => setJournal(prev => {
    // Avoid duplicates: skip entries with same date+ticker already in journal
    const existing = new Set(prev.map(e => `${e.date}|${e.ticker}`));
    const fresh = entries.filter(e => !existing.has(`${e.date}|${e.ticker}`));
    return [...fresh, ...prev];
  });

  const btnStyle = (active) => ({
    padding: "10px 24px", borderRadius: 10, border: "none",
    background: active ? COLORS.accent : "transparent",
    color: active ? COLORS.white : COLORS.gray500,
    cursor: "pointer", fontWeight: 700, fontSize: 14,
    transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif",
  });

  const actionBtn = {
    padding: "10px 20px", borderRadius: 10, border: `2px solid ${COLORS.accent}`,
    background: COLORS.white, color: COLORS.accent, cursor: "pointer",
    fontWeight: 700, fontSize: 13, transition: "all 0.2s", fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: COLORS.gray400 }}>
      Loading portfolio data...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, ${COLORS.accentFaint} 0%, ${COLORS.gray100} 100%)`, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: COLORS.white, borderBottom: `1px solid ${COLORS.gray200}`, padding: "0 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 36, height: 36, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: COLORS.white, fontWeight: 800, fontSize: 16 }}>TS</span>
            </div>
            <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: COLORS.primary, fontWeight: 400 }}>TS-8 Capital</span>
          </div>
          <div style={{ display: "flex", gap: 4, background: COLORS.gray100, borderRadius: 12, padding: 4 }}>
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)} style={btnStyle(activeTab === i)}>{tab}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 40px" }}>

        {/* TS-8 FUND TAB */}
        {activeTab === 0 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Account Value</div>
                  {lastUpdated && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: quotesLoading ? COLORS.accent : COLORS.green }} />
                      <span style={{ fontSize: 11, color: COLORS.gray400 }}>{quotesLoading ? "Updating..." : `Live ${lastUpdated.toLocaleTimeString()}`}</span>
                      <button onClick={refetch} style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "2px 6px" }}>Refresh</button>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: COLORS.primary }}>{fmtUSD(metrics.totalValue || portfolio.accountValue)}</div>
                <div style={{ fontSize: 14, color: metrics.totalPL >= 0 ? COLORS.green : COLORS.red, fontWeight: 700, marginTop: 4 }}>
                  {fmtUSD(metrics.totalPL)} ({fmtPct(metrics.totalPLPct)}) all time
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Performance</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><div style={{ fontSize: 11, color: COLORS.gray400, marginBottom: 2 }}>30-Day</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.green }}>{fmtPct(metrics.totalPLPct * 0.35)}</div></div>
                  <div><div style={{ fontSize: 11, color: COLORS.gray400, marginBottom: 2 }}>90-Day</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.green }}>{fmtPct(metrics.totalPLPct)}</div></div>
                </div>
              </Card>
              <Card>
                <div style={{ fontSize: 12, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600, marginBottom: 10 }}>Portfolio Stats</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><div style={{ fontSize: 11, color: COLORS.gray400, marginBottom: 2 }}>Positions</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{portfolio.holdings.length}</div></div>
                  <div><div style={{ fontSize: 11, color: COLORS.gray400, marginBottom: 2 }}>Avg P/E</div><div style={{ fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{avgPE(portfolio.holdings)}</div></div>
                </div>
              </Card>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h3 style={{ margin: 0, color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>S&P 500 Benchmark</h3>
                  <div style={{ display: "flex", gap: 4, background: COLORS.gray100, borderRadius: 8, padding: 3 }}>
                    {[["1mo","1M"],["3mo","3M"],["6mo","6M"],["1y","1Y"],["ytd","YTD"]].map(([val, label]) => (
                      <button key={val} onClick={() => setBenchmarkRange(val)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", fontSize: 11, fontWeight: 700, cursor: "pointer", background: benchmarkRange === val ? COLORS.accent : "transparent", color: benchmarkRange === val ? COLORS.white : COLORS.gray500 }}>{label}</button>
                    ))}
                  </div>
                </div>
                <PerfChart benchmarkData={benchmarkData} range={benchmarkRange} />
              </Card>
              <Card>
                <h3 style={{ margin: "0 0 8px", color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>Sector Allocation</h3>
                <SectorPie data={sectorData} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, justifyContent: "center" }}>
                  {sectorData.map((s, i) => (
                    <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: COLORS.gray600 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: SECTOR_COLORS[i % SECTOR_COLORS.length] }} />{s.name}
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>Current Holdings</h3>
                <button onClick={() => setShowAddHolding(true)} style={actionBtn}>+ Add Position</button>
              </div>
              <HoldingsTable holdings={liveHoldings} onDelete={deleteHolding} />
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, color: COLORS.primary, fontSize: 18, fontFamily: "'Instrument Serif', Georgia, serif" }}>Executed Trades</h3>
                <button onClick={() => setShowAddTrade(true)} style={actionBtn}>+ Log Trade</button>
              </div>
              <TradesTable trades={portfolio.trades} onDelete={deleteTrade} />
            </Card>
          </div>
        )}

        {/* DAYTRADING TAB */}
        {activeTab === 1 && (
          <DaytradingTab
            journal={journal}
            onAddEntry={addJournalEntry}
            onDeleteEntry={deleteJournalEntry}
            onImportEntries={importJournalEntries}
          />
        )}

        {/* THESIS / ANALYST TAB */}
        {activeTab === 2 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, color: COLORS.primary, fontSize: 28, fontFamily: "'Instrument Serif', Georgia, serif" }}>Investment Memos</h2>
                <p style={{ margin: "6px 0 0", color: COLORS.gray500, fontSize: 14 }}>Document your thesis before you trade. Process over outcome.</p>
              </div>
              <button onClick={() => setShowAddMemo(true)} style={{ ...actionBtn, background: COLORS.accent, color: COLORS.white }}>+ New Memo</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <Card><MetricCard label="Total Memos" value={memos.length} /></Card>
              <Card><MetricCard label="Active" value={memos.filter(m => m.status === "Active").length} color={COLORS.green} /></Card>
              <Card><MetricCard label="Watchlist" value={memos.filter(m => m.status === "Watchlist").length} color={COLORS.accent} /></Card>
            </div>
            {memos.map(m => <MemoCard key={m.id} memo={m} onDelete={deleteMemo} />)}
            {!memos.length && (
              <Card style={{ textAlign: "center", padding: 60 }}>
                <div style={{ color: COLORS.gray400, fontSize: 16 }}>No memos yet. Write your first investment thesis.</div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddHolding && <AddHoldingForm onAdd={addHolding} onClose={() => setShowAddHolding(false)} />}
      {showAddTrade && <AddTradeForm onAdd={addTrades} onClose={() => setShowAddTrade(false)} />}
      {showAddMemo && <AddMemoForm onAdd={addMemo} onClose={() => setShowAddMemo(false)} />}
    </div>
  );
}
