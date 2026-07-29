"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  AlertCircle,
  Calendar,
  CheckCircle,
  Database,
  ArrowUpDown,
  PieChart,
  TrendingUp,
  Globe2
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import safeLocalStorage from '../../utils/safeLocalStorage';
import api from '../../utils/api';

const chartColors = ['#1FA463', '#7B82FF', '#F59E0B', '#EF4444', '#14B8A6', '#A855F7'];

function percentOf(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function LineChart({ data }) {
  if (!data?.length) {
    return <div className="h-56 flex items-center justify-center text-sm text-stone-400">No scan trend data yet.</div>;
  }

  const width = 640;
  const height = 220;
  const padding = 28;
  const maxScore = Math.max(100, ...data.flatMap((item) => [item.avg_ai_score || 0, item.avg_misinformation_score || 0]));
  const xStep = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;
  const point = (item, index, key) => {
    const x = padding + xStep * index;
    const y = height - padding - ((item[key] || 0) / maxScore) * (height - padding * 2);
    return `${x},${y}`;
  };
  const aiPoints = data.map((item, index) => point(item, index, 'avg_ai_score')).join(' ');
  const misinfoPoints = data.map((item, index) => point(item, index, 'avg_misinformation_score')).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[520px] w-full h-56" role="img" aria-label="AI and misinformation score trend">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E7E5E4" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E7E5E4" />
        {[25, 50, 75, 100].map((score) => {
          const y = height - padding - (score / maxScore) * (height - padding * 2);
          return (
            <g key={score}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#F5F5F4" />
              <text x={4} y={y + 4} className="fill-stone-400 text-[10px]">{score}%</text>
            </g>
          );
        })}
        <polyline points={aiPoints} fill="none" stroke="#7B82FF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points={misinfoPoints} fill="none" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {data.map((item, index) => (
          <g key={`${item.date}-${index}`}>
            <circle cx={point(item, index, 'avg_ai_score').split(',')[0]} cy={point(item, index, 'avg_ai_score').split(',')[1]} r="4" fill="#7B82FF" />
            <circle cx={point(item, index, 'avg_misinformation_score').split(',')[0]} cy={point(item, index, 'avg_misinformation_score').split(',')[1]} r="4" fill="#EF4444" />
            <text x={padding + xStep * index - 18} y={height - 6} className="fill-stone-400 text-[10px]">
              {new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return <div className="h-56 flex items-center justify-center text-sm text-stone-400">No role data yet.</div>;
  }

  const segments = data.reduce((items, item, index) => {
    const share = (item.value / total) * 100;
    const offset = 25 - items.cumulative;
    return {
      cumulative: items.cumulative + share,
      values: [...items.values, { ...item, share, offset, color: chartColors[index % chartColors.length] }],
    };
  }, { cumulative: 0, values: [] }).values;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-44 w-44 shrink-0" role="img" aria-label="User role distribution">
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F5F5F4" strokeWidth="8" />
        {segments.map((item) => (
          <circle
            key={item.label}
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke={item.color}
            strokeWidth="8"
            strokeDasharray={`${item.share} ${100 - item.share}`}
            strokeDashoffset={item.offset}
          />
        ))}
        <text x="21" y="20" textAnchor="middle" className="fill-stone-900 text-[5px] font-bold">{total}</text>
        <text x="21" y="25" textAnchor="middle" className="fill-stone-400 text-[3px] font-semibold">users</text>
      </svg>
      <div className="w-full space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 font-semibold text-stone-700 capitalize">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
              {item.label}
            </span>
            <span className="text-stone-500">{item.value} ({percentOf(item.value, total)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SourceBars({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));

  if (!data?.length) {
    return <div className="h-56 flex items-center justify-center text-sm text-stone-400">No survey sources logged yet.</div>;
  }

  return (
    <div className="space-y-4">
      {data.slice(0, 6).map((item, index) => (
        <div key={item.label} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold text-stone-700">{item.label}</span>
            <span className="text-stone-500">{item.value}</span>
          </div>
          <div className="h-2.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(8, (item.value / max) * 100)}%`, backgroundColor: chartColors[index % chartColors.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState({ total_users: 0, total_scans: 0, total_surveys: 0 });
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [surveyLogs, setSurveyLogs] = useState([]);
  const [analytics, setAnalytics] = useState({
    source_counts: [],
    role_counts: [],
    score_trends: [],
  });
  const [databaseStatus, setDatabaseStatus] = useState('checking');

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [scanSearch, setScanSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All');
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Profile info for Sidebar
  const [displayName, setDisplayName] = useState('');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [response, health] = await Promise.all([
        api.get('/api/auth/admin-stats/'),
        api.get('/api/health/').catch(() => null),
      ]);
      setStats(response.stats || { total_users: 0, total_scans: 0, total_surveys: 0 });
      setUsers(response.users || []);
      setScans(response.scans || []);
      setSurveyLogs(response.survey_logs || []);
      setAnalytics(response.analytics || { source_counts: [], role_counts: [], score_trends: [] });
      setDatabaseStatus(health?.services?.mongodb === 'ok' ? 'connected' : 'unavailable');
    } catch (err) {
      showToast(err.message || "Error loading admin stats from backend.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    setIsMounted(true);
    const verifyAdmin = async () => {
      try {
        const response = await api.get('/api/auth/me/');
        if (!response.user?.is_admin) {
          showToast('Administrator access is required.', 'error');
          router.replace('/dashboard');
          return;
        }
        setIsAdmin(true);
        setDisplayName(response.user.username);
        setSubscriptionPlan(response.user.subscription_plan || 'Free');
        await fetchData();
      } catch {
          safeLocalStorage.setItem('veritas_redirect_after_login', '/admin');
          router.replace('/login');
      }
    };
    verifyAdmin();
  }, [fetchData, router, showToast]);

  // Sort and Filter Logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';

    if (typeof aVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  const filteredUsers = sortedUsers.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesPlan = planFilter === 'All' || u.subscription_plan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const filteredScans = scans.filter(s => {
    const matchesSearch = (s.username || '').toLowerCase().includes(scanSearch.toLowerCase()) ||
                          (s.id || '').toLowerCase().includes(scanSearch.toLowerCase());
    return matchesSearch;
  });

  if (!isMounted || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] flex items-center justify-center">
        <RefreshCw className="animate-spin text-stone-400" size={32} aria-label="Checking administrator access" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex font-sans text-stone-800">
      <Sidebar
        activeTab="admin"
        displayName={displayName}
        subscriptionPlan={subscriptionPlan}
        adminMode
      />

      <main className="flex-1 w-full px-4 py-10 md:px-8 lg:px-12 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="text-[#1FA463]" size={32} />
              Admin Control Center
            </h1>
            <p className="text-stone-500 mt-1">Monitor users, scans, and system-wide telemetry.</p>
          </div>

          <button
            onClick={fetchData}
            disabled={refreshing}
            className="md:mt-1 md:mr-1 flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl shadow-sm text-sm hover:bg-stone-800 transition disabled:opacity-50 font-medium self-start md:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {/* Dashboard Grid Stats */}
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="animate-spin text-stone-400" size={32} />
              <p className="text-stone-500 text-sm">Loading admin dashboard statistics...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {/* Card 1: Users */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <div className="p-4 rounded-xl bg-green-50 text-[#1FA463]">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-stone-400 text-sm font-semibold tracking-wide uppercase">Total Users</span>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1">{stats.total_users}</h3>
                </div>
              </div>

              {/* Card 2: Scans */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
                  <Activity size={24} />
                </div>
                <div>
                  <span className="text-stone-400 text-sm font-semibold tracking-wide uppercase">Total Scans</span>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1">{stats.total_scans}</h3>
                </div>
              </div>

              {/* Card 3: Surveys */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
                  <Globe2 size={24} />
                </div>
                <div>
                  <span className="text-stone-400 text-sm font-semibold tracking-wide uppercase">Survey Logs</span>
                  <h3 className="text-3xl font-bold text-stone-900 mt-1">{stats.total_surveys || 0}</h3>
                </div>
              </div>

              {/* Card 4: System Status */}
              <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-sm flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <div className="p-4 rounded-xl bg-purple-50 text-purple-600">
                  <Database size={24} />
                </div>
                <div>
                  <span className="text-stone-400 text-sm font-semibold tracking-wide uppercase">Database Connection</span>
                  <h3 className={`text-lg font-bold mt-2 flex items-center gap-1.5 ${
                    databaseStatus === 'connected' ? 'text-[#1FA463]' : 'text-amber-600'
                  }`}>
                    {databaseStatus === 'connected' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {databaseStatus === 'connected' ? 'Connected' : databaseStatus === 'checking' ? 'Checking...' : 'Unavailable'}
                  </h3>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8 mb-8">
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                      <TrendingUp size={19} className="text-[#7B82FF]" />
                      AI Detection and Misinformation Trend
                    </h2>
                    <p className="text-xs text-stone-400 mt-1">Daily average score from recent user analysis logs.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-stone-500"><span className="h-2.5 w-2.5 rounded-full bg-[#7B82FF]" /> AI</span>
                    <span className="flex items-center gap-1.5 text-stone-500"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Misinfo</span>
                  </div>
                </div>
                <LineChart data={analytics.score_trends || []} />
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-5">
                  <PieChart size={19} className="text-[#1FA463]" />
                  Users by Role
                </h2>
                <DonutChart data={analytics.role_counts || []} />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-8 mb-8">
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-1">Visit Source Summary</h2>
                <p className="text-xs text-stone-400 mb-5">Where people said they found the system.</p>
                <SourceBars data={analytics.source_counts || []} />
              </div>

              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-stone-900 mb-1">Recent Survey Logs</h2>
                <p className="text-xs text-stone-400 mb-5">Onboarding and feedback entries grouped by source and role.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {surveyLogs.length === 0 ? (
                    <div className="md:col-span-2 py-8 text-center text-stone-400 text-sm">
                      No survey activity logged yet.
                    </div>
                  ) : (
                    surveyLogs.slice(0, 12).map((survey) => (
                      <div key={`${survey.type}-${survey.id}`} className="border border-stone-100 rounded-xl p-3.5 bg-stone-50/20">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-[11px] font-black uppercase tracking-wide text-[#1FA463]">{survey.type}</span>
                          <span className="text-[11px] text-stone-400">
                            {survey.created_at ? new Date(survey.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-stone-800 capitalize">{survey.role || 'Unknown role'}</div>
                        <div className="text-xs text-stone-500 mt-1">Source: {survey.source || 'Unknown'}</div>
                        {survey.purpose && (
                          <div className="text-xs text-stone-400 mt-1 line-clamp-2">{survey.purpose}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Layout Split: Users & Scans */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">

              {/* User Directory */}
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-stone-900">User Directory</h2>

                  <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-center gap-3">
                    <select
                      value={planFilter}
                      onChange={(e) => setPlanFilter(e.target.value)}
                      className="px-3 py-1.5 border border-stone-200 rounded-lg text-xs font-semibold bg-stone-50 cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
                    >
                      <option value="All">All Plans</option>
                      <option value="Free">Free</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>

                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full min-[420px]:w-44 pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 text-stone-400 font-semibold text-xs uppercase tracking-wider">
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort('username')}>
                          <span className="flex items-center gap-1">User <ArrowUpDown size={12} /></span>
                        </th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort('subscription_plan')}>
                          <span className="flex items-center gap-1">Plan <ArrowUpDown size={12} /></span>
                        </th>
                        <th className="pb-3 cursor-pointer" onClick={() => handleSort('role')}>
                          <span className="flex items-center gap-1">User Role <ArrowUpDown size={12} /></span>
                        </th>
                        <th className="pb-3 cursor-pointer text-right" onClick={() => handleSort('created_at')}>
                          <span className="flex items-center justify-end gap-1">Registered <ArrowUpDown size={12} /></span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100/60">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-stone-400 text-sm">
                            No users matching filters found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-stone-50/40 transition">
                            <td className="py-3.5 pr-2">
                              <div className="font-semibold text-stone-900">{user.username}</div>
                              <div className="text-xs text-stone-400">{user.email}</div>
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                user.subscription_plan === 'Yearly' ? 'bg-purple-100 text-purple-700' :
                                user.subscription_plan === 'Monthly' ? 'bg-green-100 text-green-700' :
                                user.subscription_plan === 'Weekly' ? 'bg-blue-100 text-blue-700' :
                                'bg-stone-100 text-stone-600'
                              }`}>
                                {user.subscription_plan || 'Free'}
                              </span>
                            </td>
                            <td className="py-3.5">
                              <span className="text-xs font-bold capitalize text-stone-600">
                                {user.role || 'other'}
                              </span>
                            </td>
                            <td className="py-3.5 text-right text-xs text-stone-500 font-medium">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white border border-stone-200/80 rounded-2xl shadow-sm p-6 flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h2 className="text-lg font-bold text-stone-900">Recent Scans</h2>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search scans..."
                      value={scanSearch}
                      onChange={(e) => setScanSearch(e.target.value)}
                      className="pl-9 pr-4 py-1.5 border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 w-36"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto max-h-[460px] pr-2">
                  {filteredScans.length === 0 ? (
                    <div className="py-8 text-center text-stone-400 text-sm">
                      No recent scan activities.
                    </div>
                  ) : (
                    filteredScans.map((scan) => {
                      const aiScore = parseFloat(scan.ai_score) || 0;
                      const misinfoScore = parseFloat(scan.misinformation_score) || 0;

                      return (
                        <div key={scan.id} className="p-3.5 border border-stone-100 rounded-xl hover:border-stone-200 hover:bg-stone-50/20 transition flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-stone-800 text-[13.5px] truncate">{scan.username}</span>
                              <span className="text-[10px] text-stone-400">•</span>
                              <span className="text-[11px] text-stone-400 whitespace-nowrap">
                                {scan.created_at ? new Date(scan.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">AI Score</span>
                                <span className={`text-xs font-bold ${aiScore > 70 ? 'text-red-600' : aiScore > 35 ? 'text-amber-600' : 'text-green-600'}`}>
                                  {aiScore.toFixed(1)}%
                                </span>
                              </div>
                              <div className="h-6 w-px bg-stone-100" />
                              <div className="flex flex-col">
                                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Misinfo</span>
                                <span className={`text-xs font-bold ${misinfoScore > 70 ? 'text-red-600' : misinfoScore > 35 ? 'text-amber-600' : 'text-green-600'}`}>
                                  {misinfoScore.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            {scan.summary && (
                              <p className="text-[11px] text-stone-400 mt-2 line-clamp-2">
                                {scan.summary}
                              </p>
                            )}
                          </div>

                          <div className={`p-1.5 rounded-full ${
                            aiScore > 70 || misinfoScore > 70
                              ? 'bg-red-50 text-red-600'
                              : 'bg-green-50 text-[#1FA463]'
                          }`}>
                            <AlertCircle size={18} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}
