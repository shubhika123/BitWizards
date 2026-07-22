"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/api/admin/dashboard')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading metrics...</div>;
  }

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-bold">Failed to load dashboard data.</div>;
  }

  const { engagement, price_iq, behavioral } = data;

  return (
    <div className="min-h-screen bg-[#f5f5f7] p-6 pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-150">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">Sahi Daam Admin Dashboard</h1>
            <p className="text-xs font-bold text-gray-500">Rudimentary PoC Metrics</p>
          </div>
        </div>

        {/* 1. ENGAGEMENT DASHBOARD */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-indigo-700 tracking-wide uppercase">Engagement Dashboard</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1">Is the game collecting enough data to make meaningful inferences?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Total Players</span>
              <span className="text-2xl font-black text-gray-900">{engagement.total_players.toLocaleString()}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Completion Rate</span>
              <span className="text-2xl font-black text-gray-900">{engagement.completion_rate}%</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Avg Cards Played</span>
              <span className="text-2xl font-black text-gray-900">{engagement.avg_cards_played} <span className="text-sm text-gray-400">/ 5</span></span>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Avg Session Time</span>
              <span className="text-2xl font-black text-gray-900">{engagement.avg_session_time} <span className="text-sm text-gray-400">min</span></span>
            </div>
          </div>

          <div className="h-64 w-full mt-6">
            <h3 className="text-xs font-black text-gray-700 mb-4">Daily Participation Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagement.daily_participation_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', fontWeight: 'bold', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="players" stroke="#4f46e5" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 2. PRICE IQ DASHBOARD */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-amber-600 tracking-wide uppercase">Price IQ Dashboard</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1">What price expectations are users revealing?</p>
          </div>

          <div className="flex gap-4 mb-6">
            <div className={`p-4 rounded-xl border w-64 ${price_iq.avg_guess_error > 0 ? 'bg-emerald-50 border-emerald-200' : price_iq.avg_guess_error < 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${price_iq.avg_guess_error > 0 ? 'text-emerald-700' : price_iq.avg_guess_error < 0 ? 'text-red-700' : 'text-amber-700'}`}>Average Guess Error</span>
              <span className={`text-3xl font-black ${price_iq.avg_guess_error > 0 ? 'text-emerald-600' : price_iq.avg_guess_error < 0 ? 'text-red-600' : 'text-amber-900'}`}>
                {price_iq.avg_guess_error > 0 ? '+' : ''}{price_iq.avg_guess_error}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64">
              <h3 className="text-xs font-black text-gray-700 mb-4">Guess Error Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_iq.guess_error_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="bin" tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-64">
              <h3 className="text-xs font-black text-gray-700 mb-4">Category-wise Guess Error (%)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_iq.category_wise_error} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="category" tick={{fontSize: 10, fontWeight: 700, fill: '#6b7280'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="error" fill="#d97706" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Regional Table (Simulated Heatmap) */}
          <div className="mt-8">
            <h3 className="text-xs font-black text-gray-700 mb-4">Regional Price IQ</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {price_iq.regional_price_iq.map((reg: any, i: number) => (
                <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <span className="block text-[10px] font-black text-gray-500 mb-1 truncate">{reg.region}</span>
                  <span className={`text-lg font-black ${reg.error > 20 ? 'text-red-500' : reg.error < 15 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {reg.error}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Standard Deviation per Product */}
          <div className="mt-8">
            <h3 className="text-xs font-black text-purple-700 mb-4 uppercase tracking-wider">Net Standard Deviation per Product</h3>
            <div className="h-64 border border-gray-150 rounded-2xl p-4 bg-gray-50">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={price_iq.item_std_devs}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fontSize: 9, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} />
                  <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="std_dev" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Std Dev (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Perceived Gain and Loss */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Highest Perceived Gain */}
            <div>
              <h3 className="text-xs font-black text-emerald-700 mb-4 uppercase tracking-wider">Highest Perceived Gain (Over-guessed)</h3>
              <div className="space-y-3">
                {price_iq.highest_perceived_gain?.length > 0 ? (
                  price_iq.highest_perceived_gain.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">Actual: ₹{item.actual_price} | Mean Guess: ₹{item.guess_amount}</p>
                      </div>
                      <div className="text-sm font-black text-emerald-600">+{item.error_pct}%</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-bold">No over-guessed items.</p>
                )}
              </div>
            </div>

            {/* Highest Perceived Loss */}
            <div>
              <h3 className="text-xs font-black text-red-700 mb-4 uppercase tracking-wider">Highest Perceived Loss (Under-guessed)</h3>
              <div className="space-y-3">
                {price_iq.highest_perceived_loss?.length > 0 ? (
                  price_iq.highest_perceived_loss.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                      <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">Actual: ₹{item.actual_price} | Mean Guess: ₹{item.guess_amount}</p>
                      </div>
                      <div className="text-sm font-black text-red-600">{item.error_pct}%</div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 font-bold">No under-guessed items.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. BEHAVIORAL INSIGHTS DASHBOARD */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 space-y-8">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-lg font-black text-emerald-600 tracking-wide uppercase">Behavioral Insights</h2>
            <p className="text-[11px] font-bold text-gray-400 mt-1">What new behavioral signals are we learning?</p>
          </div>

          {/* A. Brand Familiarity */}
          <div>
            <h3 className="text-sm font-black text-gray-800 mb-2">A. Brand Familiarity</h3>
            <p className="text-[11px] font-bold text-gray-500 mb-6">Percentage improvement in accuracy after brand is revealed.</p>
            
            <div className="space-y-4 max-w-2xl">
              {behavioral.brand_familiarity.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-32 text-right text-xs font-black text-gray-700 truncate">{item.brand}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-emerald-500 rounded-full absolute left-0" 
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                  <div className="w-16 text-xs font-black text-emerald-600">+{item.score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* B. Confidence Score */}
          <div>
            <h3 className="text-sm font-black text-gray-800 mb-2">B. Confidence Score</h3>
            <p className="text-[11px] font-bold text-gray-500 mb-6">Derived from interaction behavior (slider adjustments, hesitation).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Avg Slider Adjustments</span>
                <span className="text-2xl font-black text-gray-900">{behavioral.avg_slider_adjustments}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">Avg Hesitation Time</span>
                <span className="text-2xl font-black text-gray-900">{behavioral.avg_hesitation_time} <span className="text-sm text-gray-400">s</span></span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block mb-1">Confidence Score</span>
                <span className="text-2xl font-black text-emerald-900">{behavioral.confidence_score_avg} <span className="text-sm text-emerald-600 font-bold">/ 100</span></span>
              </div>
            </div>

            <div className="h-64 max-w-2xl">
              <h3 className="text-xs font-black text-gray-700 mb-4">Confidence Score Distribution</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={behavioral.confidence_distribution}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="bin" tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
