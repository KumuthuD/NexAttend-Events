import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Search, ChevronLeft, Loader2, ArrowUpDown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { getEvent, getRegistrations, getFormFields, exportCSV, exportExcel } from '../services/api';
import AttendanceTable, { Registration } from '../components/AttendanceTable';

export default function AttendanceSheetPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [exportingCSV, setExportingCSV] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [evtRes, fldRes, regRes] = await Promise.all([
        getEvent(id!),
        getFormFields(id!),
        getRegistrations(id!)
      ]);
      setEventData(evtRes.data);
      setFields(fldRes.data);
      setRegistrations(regRes.data?.registrations || regRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'csv' | 'excel') => {
    try {
      if (type === 'csv') setExportingCSV(true);
      else setExportingExcel(true);
      
      const apiCall = type === 'csv' ? exportCSV : exportExcel;
      const res = await apiCall(id!, statusFilter);
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventData?.title}_attendance.${type === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setExportingCSV(false);
      setExportingExcel(false);
    }
  };

  // Derived state
  const totalRegistered = registrations.length;
  const totalCheckedIn = registrations.filter(r => r.checked_in).length;
  const checkInRate = totalRegistered ? Math.round((totalCheckedIn / totalRegistered) * 100) : 0;

  const filteredRegistrations = registrations.filter(r => {
    // Status filter
    if (statusFilter === 'checked_in' && !r.checked_in) return false;
    if (statusFilter === 'not_checked_in' && r.checked_in) return false;
    
    // Search filter
    if (search) {
      const q = search.toLowerCase();
      const match = Object.values(r.form_data).some(val => 
        String(val).toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });

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

        <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span className="hover:text-[#00d4ff] cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <ChevronLeft size={14} className="rotate-180" />
            <span className="text-gray-300">Attendance</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">{eventData?.title}</h1>
              <p className="text-gray-400">Attendance Management</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleExport('csv')}
                disabled={exportingCSV}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exportingCSV ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Export CSV
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={exportingExcel}
                className="px-5 py-2.5 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 rounded-xl transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exportingExcel ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                Export Excel
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Registered', value: totalRegistered, color: 'text-white' },
              { label: 'Checked In', value: totalCheckedIn, color: 'text-green-400' },
              { label: 'Not Yet', value: totalRegistered - totalCheckedIn, color: 'text-gray-400' },
              { label: 'Check-In Rate', value: `${checkInRate}%`, color: 'text-[#00d4ff]' }
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                <p className="text-sm text-gray-400 font-medium mb-1">{stat.label}</p>
                <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search participant details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#7c3aed]/50 transition-colors"
            >
              <option value="all" className="bg-[#0a0a1a]">All Statuses</option>
              <option value="checked_in" className="bg-[#0a0a1a]">Checked In</option>
              <option value="not_checked_in" className="bg-[#0a0a1a]">Not Checked In</option>
            </select>
          </div>

          {/* Data Table */}
          <AttendanceTable registrations={filteredRegistrations} fields={fields} />

        </div>
      </main>
    </div>
  );
}
