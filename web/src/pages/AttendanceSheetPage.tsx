import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Search, ChevronLeft, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getEvent, getRegistrations, getFormFields, exportCSV, exportExcel } from '../services/api';
import AttendanceTable, { Registration, FormField } from '../components/AttendanceTable';
import { useToast } from '../contexts/ToastContext';
import type { Event } from '../types';

const WS_BASE_DELAY = 1000;
const WS_MAX_DELAY = 30000;

export default function AttendanceSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(WS_BASE_DELAY);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchData();
    setupWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [id]);

  const setupWebSocket = useCallback(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const wsUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/^http/, 'ws') + `/ws/events/${id}?token=${token}`
      : `ws://localhost:8000/ws/events/${id}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectDelayRef.current = WS_BASE_DELAY;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_check_in') {
          setRegistrations(prev => prev.map(reg =>
            reg.id === data.registration_id
              ? { ...reg, checked_in: true, checked_in_at: data.checked_in_at }
              : reg
          ));
        }
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      const delay = Math.min(reconnectDelayRef.current * 2, WS_MAX_DELAY);
      reconnectDelayRef.current = delay;
      reconnectTimeoutRef.current = setTimeout(setupWebSocket, delay);
    };

    ws.onerror = () => ws.close();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evtRes, fldRes, regRes] = await Promise.all([
        getEvent(id!),
        getFormFields(id!),
        getRegistrations(id!),
      ]);
      setEventData(evtRes.data);
      setFields(fldRes.data);
      setRegistrations(regRes.data?.registrations || regRes.data || []);
    } catch (err) {
      console.error(err);
      toastError('Load Failed', 'Could not load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const regRes = await getRegistrations(id!);
      setRegistrations(regRes.data?.registrations || regRes.data || []);
    } catch {
      toastError('Refresh Failed', 'Could not refresh registrations.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExport = async (type: 'csv' | 'excel') => {
    try {
      if (type === 'csv') setExportingCSV(true);
      else setExportingExcel(true);

      const apiCall = type === 'csv' ? exportCSV : exportExcel;
      const res = await apiCall(id!, statusFilter === 'all' ? undefined : statusFilter);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventData?.title}_attendance.${type === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      success('Export Complete', `Downloaded ${type.toUpperCase()} attendance sheet.`);
    } catch {
      toastError('Export Failed', 'Please try again.');
    } finally {
      setExportingCSV(false);
      setExportingExcel(false);
    }
  };

  // Derived stats
  const totalRegistered = registrations.length;
  const totalCheckedIn = registrations.filter(r => r.checked_in).length;
  const checkInRate = totalRegistered ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  const filteredRegistrations = registrations.filter(r => {
    if (statusFilter === 'checked_in' && !r.checked_in) return false;
    if (statusFilter === 'not_checked_in' && r.checked_in) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = Object.values(r.form_data).some(val => String(val).toLowerCase().includes(q))
        || (r.email || '').toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedRegistrations = filteredRegistrations.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0a1a]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a] text-white font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-[#7c3aed]/8 via-transparent to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <span className="hover:text-[#00d4ff] cursor-pointer transition-colors" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-300">Attendance</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">{eventData?.title}</h1>
              <p className="text-gray-400">Attendance Management · Live sync enabled</p>
            </div>

            <div className="flex gap-3 items-center">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exportingCSV}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exportingCSV ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exportingExcel}
                className="px-5 py-2.5 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Excel
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Registered', value: totalRegistered, color: 'text-white' },
              { label: 'Checked In', value: totalCheckedIn, color: 'text-green-400' },
              { label: 'Not Yet', value: totalRegistered - totalCheckedIn, color: 'text-gray-400' },
              { label: 'Check-In Rate', value: `${checkInRate}%`, color: 'text-[#00d4ff]' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <p className="text-sm text-gray-400 font-medium mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
                {stat.label === 'Check-In Rate' && (
                  <div className="mt-2 w-full bg-white/10 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-[#00d4ff] rounded-full transition-all duration-700"
                      style={{ width: `${checkInRate}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search participant details..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]/50 transition-colors text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as 'all' | 'checked_in' | 'not_checked_in'); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#7c3aed]/50 transition-colors text-sm"
            >
              <option value="all" className="bg-[#0a0a1a]">All Statuses</option>
              <option value="checked_in" className="bg-[#0a0a1a]">Checked In</option>
              <option value="not_checked_in" className="bg-[#0a0a1a]">Not Checked In</option>
            </select>
          </div>

          <div className="text-xs text-gray-600 mb-3">
            Showing {filteredRegistrations.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRegistrations.length)} of {filteredRegistrations.length} registrations
          </div>

          {/* Table */}
          <AttendanceTable registrations={paginatedRegistrations} fields={fields} />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | 'ellipsis')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('ellipsis');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === 'ellipsis' ? (
                      <span key={`e${i}`} className="px-1 text-gray-600 text-sm">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                          safePage === p
                            ? 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
