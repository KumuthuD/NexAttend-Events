import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvent, checkIn, getRegistrations } from '../services/api';
import QRScanner from '../components/QRScanner';
import { CheckCircle2, AlertCircle, XCircle, ChevronLeft, Search, Loader2, X, UserCheck } from 'lucide-react';

interface EventData {
  id: string;
  title: string;
  capacity: number;
  checked_in_count: number;
}

interface ScanResult {
  status: 'checked_in' | 'already_checked_in' | 'error';
  message: string;
  participantName?: string;
  timestamp?: string;
}

export default function ScannerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manual Check-In Modal State
  const [showModal, setShowModal] = useState(false);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Throttle scans to avoid rapid repeated requests
  const [lastScannedId, setLastScannedId] = useState<string>('');
  
  useEffect(() => {
    if (!id) return;
    fetchEvent();
    // Refresh counter every 10 seconds
    const interval = setInterval(fetchEvent, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchEvent = async () => {
    try {
      const res = await getEvent(id!);
      setEventData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const res = await getRegistrations(id!);
      setRegistrations(res.data?.registrations || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const openManualCheckIn = () => {
    setShowModal(true);
    fetchRegistrations();
  };

  const handleManualCheckIn = async (qrCodeId: string, participantName: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const res = await checkIn(qrCodeId);
      const data = res.data;
      
      setLastScan({
        status: data.status === 'already_checked_in' ? 'already_checked_in' : 'checked_in',
        message: data.message,
        participantName: data.participant?.full_name || data.participant?.['Full Name'] || participantName,
        timestamp: new Date().toLocaleTimeString()
      });
      
      if (data.status === 'checked_in') {
        setEventData(prev => prev ? { ...prev, checked_in_count: prev.checked_in_count + 1 } : prev);
        // Also update local list so the UI reflects the change immediately
        setRegistrations(prev => prev.map(r => r.qr_code_id === qrCodeId ? { ...r, checked_in: true } : r));
      }
      
      const audio = new Audio(data.status === 'checked_in' ? '/success.mp3' : '/warn.mp3');
      audio.play().catch(e => console.log('Audio blocked', e));
      setShowModal(false); // Can close modal on success or leave it open, let's leave it open but updated
    } catch (err: any) {
      setLastScan({
        status: 'error',
        message: err.response?.data?.detail || 'Invalid Check In',
        timestamp: new Date().toLocaleTimeString()
      });
      const audio = new Audio('/error.mp3');
      audio.play().catch(e => console.log('Audio blocked', e));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScan = useCallback(async (decodedText: string) => {
    // Debounce exact same QR code scans (wait 3 seconds before allowing the same code)
    if (decodedText === lastScannedId || isProcessing) return;
    
    setIsProcessing(true);
    setLastScannedId(decodedText);
    
    // Clear debounce after 3 seconds
    setTimeout(() => setLastScannedId(''), 3000);

    try {
      const res = await checkIn(decodedText);
      const data = res.data;
      
      setLastScan({
        status: data.status === 'already_checked_in' ? 'already_checked_in' : 'checked_in',
        message: data.message,
        participantName: data.participant?.full_name || data.participant?.['Full Name'],
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Update count locally
      if (data.status === 'checked_in') {
        setEventData(prev => prev ? { ...prev, checked_in_count: prev.checked_in_count + 1 } : prev);
      }
      
      // Optional: Play sound
      const audio = new Audio(data.status === 'checked_in' ? '/success.mp3' : '/warn.mp3');
      audio.play().catch(e => console.log('Audio blocked', e));
      
    } catch (err: any) {
      setLastScan({
        status: 'error',
        message: err.response?.data?.detail || 'Invalid QR Code',
        timestamp: new Date().toLocaleTimeString()
      });
      const audio = new Audio('/error.mp3');
      audio.play().catch(e => console.log('Audio blocked', e));
    } finally {
      setIsProcessing(false);
    }
  }, [lastScannedId, isProcessing]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans flex flex-col items-center relative overflow-hidden">
      {/* Flash Effect overlay */}
      <AnimatePresence>
        {lastScan?.status === 'checked_in' && (
          <motion.div 
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-green-500/20 z-[60] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-lg p-5 flex items-center justify-between border-b border-white/10 bg-white/[0.02]">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg max-w-[200px] truncate text-center">
          {eventData?.title || 'Scanner'}
        </h1>
        <button onClick={openManualCheckIn} className="p-2 -mr-2 text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-full transition-colors relative group">
          <Search className="w-5 h-5" />
          <span className="absolute -bottom-10 right-0 w-max bg-white/10 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            Manual Search
          </span>
        </button>
      </header>
      
      {/* Live Counter */}
      <div className="mt-8 mb-6 text-center">
        <div className="inline-flex flex-col items-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <span className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Checked In</span>
          <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
            {eventData?.checked_in_count || 0}
            <span className="text-xl text-gray-500 font-medium">
              {eventData?.capacity ? ` / ${eventData.capacity}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Scanner Viewfinder */}
      <main className="w-full max-w-lg px-6 flex-1 flex flex-col relative">
        <div className="w-full aspect-square relative mb-6">
          <QRScanner onScan={handleScan} />
        </div>

        {/* Scan Result Card */}
        <div className="h-32 mb-8 relative">
          <AnimatePresence mode="wait">
            {lastScan ? (
              <motion.div
                key={lastScan.timestamp}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className={`w-full p-5 rounded-2xl flex items-start gap-4 border shadow-xl backdrop-blur-md
                  ${lastScan.status === 'checked_in' ? 'bg-green-500/10 border-green-500/30' : 
                    lastScan.status === 'already_checked_in' ? 'bg-yellow-500/10 border-yellow-500/30' : 
                    'bg-red-500/10 border-red-500/30'}
                `}
              >
                <div className="mt-1">
                  {lastScan.status === 'checked_in' && <CheckCircle2 className="w-8 h-8 text-green-400" />}
                  {lastScan.status === 'already_checked_in' && <AlertCircle className="w-8 h-8 text-yellow-400" />}
                  {lastScan.status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-1
                    ${lastScan.status === 'checked_in' ? 'text-green-400' : 
                      lastScan.status === 'already_checked_in' ? 'text-yellow-400' : 
                      'text-red-500'}
                  `}>
                    {lastScan.status === 'checked_in' ? 'Success!' : 
                     lastScan.status === 'already_checked_in' ? 'Duplicate Scan' : 
                     'Invalid QR'}
                  </h3>
                  <p className="text-gray-300 text-sm leading-snug">
                    {lastScan.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    Scanned at {lastScan.timestamp}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 border border-white/5 rounded-2xl bg-white/[0.02]">
                <p>Point camera at QR code</p>
                <p className="text-sm mt-1">Codes will scan automatically</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Manual Check-In Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a1a]/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.95 }}
              className="w-full max-w-md bg-[#13132b] rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold">Manual Check-In</h2>
                <button onClick={() => setShowModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 border-b border-white/10 bg-white/[0.02]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search name or email..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-10 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {loadingRegistrations ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00d4ff]" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {registrations.filter(r => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return Object.values(r.form_data).some(val => String(val).toLowerCase().includes(q));
                    }).map((reg) => {
                      const name = reg.form_data['Full Name'] || reg.form_data['full_name'] || 'Unknown';
                      const email = reg.form_data['Email'] || reg.form_data['email'] || '';
                      return (
                        <div key={reg.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between group">
                          <div className="truncate pr-4 flex-1">
                            <p className="font-medium truncate text-gray-200">{name}</p>
                            <p className="text-xs text-gray-500 truncate">{email}</p>
                          </div>
                          {reg.checked_in ? (
                            <span className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium rounded-lg shrink-0">
                              Checked In
                            </span>
                          ) : (
                            <button 
                              onClick={() => handleManualCheckIn(reg.qr_code_id, name)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                              Check In
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {registrations.length === 0 && !loadingRegistrations && (
                      <p className="text-center text-gray-500 py-6 text-sm">No registrations found.</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
