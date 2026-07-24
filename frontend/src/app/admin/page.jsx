"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  UserCheck,
  AlertCircle,
  Calendar,
  CheckCircle,
  Database,
  ArrowUpDown
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useToast } from '../../components/ToastProvider';
import safeLocalStorage from '../../utils/safeLocalStorage';
import api from '../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [stats, setStats] = useState({ total_users: 0, total_scans: 0 });
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
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
      setStats(response.stats || { total_users: 0, total_scans: 0 });
      setUsers(response.users || []);
      setScans(response.scans || []);
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
        router.replace('/login');
      }
    };
    verifyAdmin();
  }, [fetchData, router, showToast]);

  const handleAdminLogout = async () => {
    try {
      await api.post('/api/auth/logout/');
    } catch {
      // Local session data must still be cleared if the server is unavailable.
    }
    safeLocalStorage.removeItem('veritas_display_name');
    safeLocalStorage.removeItem('veritas_email');
    safeLocalStorage.removeItem('veritas_is_admin');
    router.push('/login');
  };

  const toggleUserAdmin = async (userId, currentIsAdmin) => {
    try {
      const updatedIsAdmin = !currentIsAdmin;
      const response = await api.patch(`/api/auth/admin-users/${userId}/`, {
        is_admin: updatedIsAdmin,
      });
      setUsers((currentUsers) => currentUsers.map(
        (user) => user.id === userId ? response.user : user
      ));
      showToast(response.message || 'User permissions updated.', "success");
    } catch (err) {
      showToast(err.message || "Failed to update administrator status.", "error");
    }
  };

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
      />

      <main className="flex-1 w-full px-4 py-10 md:px-8 lg:px-12 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl shadow-sm text-sm hover:bg-stone-800 transition disabled:opacity-50 font-medium"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button
            onClick={handleAdminLogout}
            className="px-4 py-2 border border-stone-200 text-stone-700 rounded-xl shadow-sm text-sm hover:bg-white transition font-medium"
          >
            Logout
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
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

              {/* Card 3: System Status */}
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
                        <th className="pb-3">Role</th>
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
                              <button
                                onClick={() => toggleUserAdmin(user.id, user.is_admin)}
                                className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border font-semibold transition ${
                                  user.is_admin
                                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                <UserCheck size={12} />
                                {user.is_admin ? 'Admin' : 'Make Admin'}
                              </button>
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
