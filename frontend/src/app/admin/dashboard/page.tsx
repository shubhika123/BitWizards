"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { ArrowLeft, RefreshCw, RotateCcw } from "lucide-react";
import Link from "next/link";

import { API_BASE_URL } from "@/lib/apiConfig";

const MYNTRA = {
  pink: "#ff3f6c",
  navy: "#282c3f",
  border: "#eaeaec",
  muted: "#94969f",
  surface: "#f5f5f6",
  amber: "#f59e0b",
};

const tooltipStyle = {
  borderRadius: "8px",
  fontWeight: 700,
  fontSize: "11px",
  border: `1px solid ${MYNTRA.border}`,
  boxShadow: "0 4px 12px rgba(40,44,63,0.08)",
  color: MYNTRA.navy,
};

const tickStyle = { fontSize: 10, fontWeight: 700, fill: MYNTRA.muted };

function SectionTitle({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="border-b border-[#eaeaec] pb-3 mb-1">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ff3f6c]">{eyebrow}</p>
      <h2 className="text-base font-black text-[#282c3f] tracking-tight mt-1 uppercase">{title}</h2>
      <div className="h-0.5 w-10 bg-[#ff3f6c] mt-2 mb-2" />
      <p className="text-[11px] font-semibold text-[#94969f]">{subtitle}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent = false,
}: {
  label: string;
  value: React.ReactNode;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        accent
          ? "bg-pink-50/80 border-pink-100"
          : "bg-[#f5f5f6] border-[#eaeaec]"
      }`}
    >
      <span
        className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
          accent ? "text-[#ff3f6c]" : "text-[#94969f]"
        }`}
      >
        {label}
      </span>
      <span className="text-2xl font-black text-[#282c3f]">
        {value}
        {suffix ? <span className="text-sm text-[#94969f] font-bold"> {suffix}</span> : null}
      </span>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback((opts?: { silent?: boolean }) => {
    const silent = Boolean(opts?.silent);
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    return fetch(`${API_BASE_URL}/api/admin/dashboard`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Dashboard request failed (${res.status})`);
        }
        const d = await res.json();
        if (!d?.engagement || !d?.price_iq || !d?.behavioral) {
          throw new Error("Dashboard response missing engagement/price_iq/behavioral");
        }
        setData(d);
        setLastUpdated(new Date());
      })
      .catch((e) => {
        console.error(e);
        if (!silent) {
          setData(null);
        }
      })
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const id = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [loadDashboard]);

  const handleResetGameData = async () => {
    const ok = window.confirm(
      "Reset all Sahi Daam play data for every user?\n\nThis clears decks, guesses, points, streaks, and preferences, then restores demo seed data.\n\nInteraction logs are kept."
    );
    if (!ok) return;

    setResetting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sahidaam/reset`, { method: "POST" });
      if (!res.ok) {
        throw new Error(`Reset failed (${res.status})`);
      }
      const body = await res.json();
      if (body?.metrics?.engagement) {
        setData(body.metrics);
        setLastUpdated(new Date());
      } else {
        await loadDashboard({ silent: true });
      }
    } catch (e) {
      console.error(e);
      alert("Failed to reset game data. Check that the API server is running.");
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-[#94969f] font-bold gap-3">
        <div className="w-9 h-9 border-4 border-pink-100 border-t-[#ff3f6c] rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest">Loading metrics…</span>
      </div>
    );
  }

  if (!data?.engagement || !data?.price_iq || !data?.behavioral) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-[#ff3f6c] font-bold text-sm px-6 text-center">
        Failed to load dashboard data.
      </div>
    );
  }

  const { engagement, price_iq, behavioral } = data;
  const errorTone =
    price_iq.avg_guess_error > 0
      ? "positive"
      : price_iq.avg_guess_error < 0
        ? "negative"
        : "neutral";

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-[#282c3f]">
      {/* Sticky Myntra-style top bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-[#eaeaec]">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="p-2 hover:bg-[#f5f5f6] rounded-lg transition-colors text-[#282c3f] hover:text-[#ff3f6c]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#ff3f6c]">Sahi Daam</p>
            <h1 className="text-[15px] font-black text-[#282c3f] tracking-tight uppercase truncate">
              Admin Dashboard
            </h1>
          </div>
          <div className="hidden sm:flex flex-col items-end mr-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#94969f]">
              Auto every 30s
            </span>
            {lastUpdated ? (
              <span className="text-[10px] font-semibold text-[#94969f]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => loadDashboard({ silent: true })}
            disabled={refreshing || loading}
            title="Refresh dashboard data"
            className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#282c3f] bg-white hover:bg-[#f5f5f6] border border-[#eaeaec] disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleResetGameData}
            disabled={resetting}
            title="Reset all game data"
            className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#ff3f6c] bg-white hover:bg-pink-50 border border-[#ff3f6c]/40 disabled:opacity-60 disabled:cursor-not-allowed px-3 py-2 rounded-lg transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting…" : "Reset"}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-5 space-y-5">
        {/* ENGAGEMENT */}
        <section className="bg-white p-5 rounded-xl border border-[#eaeaec] shadow-sm space-y-5">
          <SectionTitle
            eyebrow="01 · Reach"
            title="Engagement"
            subtitle="Is the game collecting enough data to make meaningful inferences?"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Total Players" value={engagement.total_players.toLocaleString()} />
            <StatCard label="Completion Rate" value={`${engagement.completion_rate}%`} />
            <StatCard label="Avg Cards Played" value={engagement.avg_cards_played} suffix="/ 5" />
            <StatCard label="Avg Session Time" value={engagement.avg_session_time} suffix="min" accent />
          </div>

          <div className="h-64 w-full pt-2">
            <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
              Daily Participation Trend
            </h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={engagement.daily_participation_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="players"
                  stroke={MYNTRA.pink}
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: MYNTRA.pink }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* PRICE IQ */}
        <section className="bg-white p-5 rounded-xl border border-[#eaeaec] shadow-sm space-y-5">
          <SectionTitle
            eyebrow="02 · Pricing"
            title="Price IQ"
            subtitle="What price expectations are users revealing?"
          />

          <div
            className={`p-4 rounded-xl border w-full sm:w-64 ${
              errorTone === "positive"
                ? "bg-emerald-50 border-emerald-100"
                : errorTone === "negative"
                  ? "bg-pink-50 border-pink-100"
                  : "bg-amber-50 border-amber-100"
            }`}
          >
            <span
              className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                errorTone === "positive"
                  ? "text-emerald-700"
                  : errorTone === "negative"
                    ? "text-[#ff3f6c]"
                    : "text-amber-700"
              }`}
            >
              Average Guess Error
            </span>
            <span
              className={`text-3xl font-black ${
                errorTone === "positive"
                  ? "text-emerald-600"
                  : errorTone === "negative"
                    ? "text-[#ff3f6c]"
                    : "text-[#282c3f]"
              }`}
            >
              {price_iq.avg_guess_error > 0 ? "+" : ""}
              {price_iq.avg_guess_error}%
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
                Guess Error Distribution
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={price_iq.guess_error_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="bin" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: "#f5f5f6" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill={MYNTRA.pink} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-64">
              <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
                Category-wise Guess Error (%)
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={price_iq.category_wise_error} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={tickStyle} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ ...tickStyle, fill: MYNTRA.navy }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip cursor={{ fill: "#f5f5f6" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="error" fill={MYNTRA.navy} radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
              Regional Price IQ
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {price_iq.regional_price_iq.map((reg: any, i: number) => (
                <div
                  key={i}
                  className="bg-[#f5f5f6] border border-[#eaeaec] rounded-lg p-3 text-center"
                >
                  <span className="block text-[10px] font-black text-[#94969f] mb-1 truncate uppercase tracking-wide">
                    {reg.region}
                  </span>
                  <span
                    className={`text-lg font-black ${
                      reg.error > 20
                        ? "text-[#ff3f6c]"
                        : reg.error < 15
                          ? "text-emerald-500"
                          : "text-amber-500"
                    }`}
                  >
                    {reg.error}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
              Net Standard Deviation per Product
            </h3>
            <div className="h-64 border border-[#eaeaec] rounded-xl p-4 bg-[#f5f5f6]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_iq.item_std_devs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    tick={tickStyle}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => (val.length > 12 ? val.substring(0, 12) + "…" : val)}
                  />
                  <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: "#fff" }} contentStyle={tooltipStyle} />
                  <Bar dataKey="std_dev" fill={MYNTRA.amber} radius={[4, 4, 0, 0]} name="Std Dev (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-3">
                Highest Perceived Gain (Over-guessed)
              </h3>
              <div className="space-y-2">
                {price_iq.highest_perceived_gain?.length > 0 ? (
                  price_iq.highest_perceived_gain.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#f5f5f6] p-3 rounded-lg border border-[#eaeaec]"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover border border-[#eaeaec]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#282c3f] truncate uppercase">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#94969f] font-semibold">
                          Actual: ₹{item.actual_price} | Mean Guess: ₹{item.guess_amount}
                          {item.guess_count != null ? ` | Guesses: ${item.guess_count}` : ""}
                        </p>
                      </div>
                      <div className="text-sm font-black text-emerald-600">+{item.error_pct}%</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#94969f] font-bold">No over-guessed items.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-[#ff3f6c] uppercase tracking-wider mb-3">
                Highest Perceived Loss (Under-guessed)
              </h3>
              <div className="space-y-2">
                {price_iq.highest_perceived_loss?.length > 0 ? (
                  price_iq.highest_perceived_loss.map((item: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-[#f5f5f6] p-3 rounded-lg border border-[#eaeaec]"
                    >
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover border border-[#eaeaec]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[#282c3f] truncate uppercase">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-[#94969f] font-semibold">
                          Actual: ₹{item.actual_price} | Mean Guess: ₹{item.guess_amount}
                          {item.guess_count != null ? ` | Guesses: ${item.guess_count}` : ""}
                        </p>
                      </div>
                      <div className="text-sm font-black text-[#ff3f6c]">{item.error_pct}%</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#94969f] font-bold">No under-guessed items.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* BEHAVIORAL */}
        <section className="bg-white p-5 rounded-xl border border-[#eaeaec] shadow-sm space-y-6">
          <SectionTitle
            eyebrow="03 · Signals"
            title="Behavioral Insights"
            subtitle="What new behavioral signals are we learning?"
          />

          <div>
            <h3 className="text-xs font-black text-[#282c3f] uppercase tracking-wide mb-1">
              A. Brand Familiarity
            </h3>
            <p className="text-[11px] font-semibold text-[#94969f] mb-4">
              Percentage improvement in accuracy after brand is revealed.
            </p>

            <div className="space-y-3 max-w-2xl">
              {behavioral.brand_familiarity?.length > 0 ? (
                behavioral.brand_familiarity.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-28 text-right text-[11px] font-black text-[#282c3f] truncate">
                      {item.brand}
                    </div>
                    <div className="flex-1 bg-[#f5f5f6] rounded-full h-3 relative overflow-hidden border border-[#eaeaec]">
                      <div
                        className="h-full bg-[#ff3f6c] rounded-full absolute left-0"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <div className="w-14 text-[11px] font-black text-[#ff3f6c]">+{item.score}%</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#94969f] font-bold">No brand familiarity data yet.</p>
              )}
            </div>
          </div>

          <div className="w-full h-px bg-[#eaeaec]" />

          <div>
            <h3 className="text-xs font-black text-[#282c3f] uppercase tracking-wide mb-1">
              B. Confidence Score
            </h3>
            <p className="text-[11px] font-semibold text-[#94969f] mb-4">
              Derived from interaction behavior (slider adjustments, hesitation).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              <StatCard label="Avg Slider Adjustments" value={behavioral.avg_slider_adjustments} />
              <StatCard label="Avg Hesitation Time" value={behavioral.avg_hesitation_time} suffix="s" />
              <StatCard label="Confidence Score" value={behavioral.confidence_score_avg} suffix="/ 100" accent />
            </div>

            <div className="h-64 max-w-2xl">
              <h3 className="text-[10px] font-black text-[#282c3f] uppercase tracking-wider mb-3">
                Confidence Score Distribution
              </h3>
              {behavioral.confidence_distribution?.length > 0 ? (
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={behavioral.confidence_distribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="bin" tick={tickStyle} axisLine={false} tickLine={false} />
                    <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: "#f5f5f6" }} contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill={MYNTRA.navy} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#94969f] font-bold pt-6">No confidence distribution yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
