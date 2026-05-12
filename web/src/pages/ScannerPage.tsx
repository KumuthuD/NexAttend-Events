import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvent, checkIn, getRegistrations } from '../services/api';
import QRScanner from '../components/QRScanner';
import { CheckCircle2, AlertCircle, XCircle, ChevronLeft, Search, Loader2, X, UserCheck, Maximize2, Minimize2, Lightbulb, LightbulbOff, Clock } from 'lucide-react';
import type { Event, Registration, ScanResult } from '../types';

const WS_MAX_RECONNECT_DELAY = 30000;
const WS_BASE_DELAY = 1000;
const MAX_RECENT_SCANS = 8;

interface RecentScan extends ScanResult {
  id: string;
}

export default function ScannerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  // Manual Check-In Modal
  const [showModal, setShowModal] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [lastScannedId, setLastScannedId] = useState<string>('');
  const processingRef = useRef(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(WS_BASE_DELAY);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchEvent();
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

    ws.onopen = () => { reconnectDelayRef.current = WS_BASE_DELAY; };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_check_in') {
          if (data.new_total_count !== undefined) {
            setEventData(prev => prev ? { ...prev, checked_in_count: data.new_total_count } : prev);
          } else {
            setEventData(prev => prev ? { ...prev, checked_in_count: prev.checked_in_count + 1 } : prev);
          }
          setRegistrations(prev => prev.map(r =>
            r.id === data.registration_id ? { ...r, checked_in: true, checked_in_at: data.checked_in_at } : r
          ));
        }
      } catch { /* ignore parse errors */ }
    };

    ws.onclose = () => {
      const delay = Math.min(reconnectDelayRef.current * 2, WS_MAX_RECONNECT_DELAY);
      reconnectDelayRef.current = delay;
      reconnectTimeoutRef.current = setTimeout(setupWebSocket, delay);
    };

    ws.onerror = () => { ws.close(); };
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

  const toggleTorch = async () => {
    const videoEl = document.querySelector('#qr-reader video') as HTMLVideoElement | null;
    if (!videoEl?.srcObject) return;
    const stream = videoEl.srcObject as MediaStream;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torchOn } as MediaTrackConstraintSet] });
      setTorchOn(prev => !prev);
    } catch {
      // torch not supported on this device — silently ignore
    }
  };

  const vibrateDevice = (pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch { /* not supported */ }
  };

  const pushRecentScan = (scan: ScanResult) => {
    setRecentScans(prev => [{ ...scan, id: Math.random().toString(36).slice(2) }, ...prev].slice(0, MAX_RECENT_SCANS));
  };

  const handleManualCheckIn = async (qrCodeId: string, participantName: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);
    try {
      const res = await checkIn(qrCodeId);
      const data = res.data;

      const scan: ScanResult = {
        status: data.status === 'already_checked_in' ? 'already_checked_in' : 'checked_in',
        message: data.message,
        participantName: data.participant?.full_name || data.participant?.['Full Name'] || participantName,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastScan(scan);
      pushRecentScan(scan);

      if (data.status === 'checked_in') {
        vibrateDevice(200);
        if (data.new_total_count !== undefined) {
          setEventData(prev => prev ? { ...prev, checked_in_count: data.new_total_count } : prev);
        } else {
          setEventData(prev => prev ? { ...prev, checked_in_count: prev.checked_in_count + 1 } : prev);
        }
        setRegistrations(prev => prev.map(r => r.qr_code_id === qrCodeId ? { ...r, checked_in: true } : r));
      }

      const audio = new Audio(data.status === 'checked_in' ? '/success.mp3' : '/warn.mp3');
      audio.play().catch(() => {});
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const scan: ScanResult = {
        status: 'error',
        message: axiosErr.response?.data?.detail || 'Invalid Check In',
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastScan(scan);
      pushRecentScan(scan);
      vibrateDevice([100, 50, 100]);
      const audio = new Audio('/error.mp3');
      audio.play().catch(() => {});
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  const handleScan = useCallback(async (decodedText: string) => {
    if (decodedText === lastScannedId || processingRef.current) return;

    processingRef.current = true;
    setIsProcessing(true);
    setLastScannedId(decodedText);

    try {
      const res = await checkIn(decodedText);
      const data = res.data;

      const scan: ScanResult = {
        status: data.status === 'already_checked_in' ? 'already_checked_in' : 'checked_in',
        message: data.message,
        participantName: data.participant?.full_name || data.participant?.['Full Name'],
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastScan(scan);
      pushRecentScan(scan);

      if (data.status === 'checked_in') {
        vibrateDevice(200);
        if (data.new_total_count !== undefined) {
          setEventData(prev => prev ? { ...prev, checked_in_count: data.new_total_count } : prev);
        } else {
          setEventData(prev => prev ? { ...prev, checked_in_count: prev.checked_in_count + 1 } : prev);
        }
      }

      const audio = new Audio(data.status === 'checked_in' ? '/success.mp3' : '/warn.mp3');
      audio.play().catch(() => {});
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      const scan: ScanResult = {
        status: 'error',
        message: axiosErr.response?.data?.detail || 'Invalid QR Code',
        timestamp: new Date().toLocaleTimeString(),
      };
      setLastScan(scan);
      pushRecentScan(scan);
      vibrateDevice([100, 50, 100]);
      const audio = new Audio('/error.mp3');
      audio.play().catch(() => {});
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      setTimeout(() => setLastScannedId(''), 3000);
    }
  }, [lastScannedId]);

  const filteredRegs = registrations.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(r.form_data).some(val => String(val).toLowerCase().includes(q));
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    );
  }

  const checkedIn = eventData?.checked_in_count ?? 0;
  const capacity = eventData?.capacity ?? 0;
  const fillPct = capacity > 0 ? Math.min((checkedIn / capacity) * 100, 100) : null;

  const scanStatusConfig = {
    checked_in: { icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, label: 'Checked In', labelClass: 'text-green-400', rowClass: 'border-green-500/20 bg-green-500/5' },
    already_checked_in: { icon: <AlertCircle className="w-5 h-5 text-yellow-400" />, label: 'Duplicate', labelClass: 'text-yellow-400', rowClass: 'border-yellow-500/20 bg-yellow-500/5' },
    error: { icon: <XCircle className="w-5 h-5 text-red-400" />, label: 'Invalid', labelClass: 'text-red-400', rowClass: 'border-red-500/20 bg-red-500/5' },
  };

  return (
    <div className={`bg-[#0a0a1a] text-white font-sans relative overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Green flash on success */}
      <AnimatePresence>
        {lastScan?.status === 'checked_in' && (
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 bg-green-500/20 z-[60] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#7c3aed]/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      {/* ── Header ── */}
      <header className="w-full px-4 py-3 flex items-center justify-between border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
        <button
          onClick={() => isFullscreen ? setIsFullscreen(false) : navigate('/dashboard')}
          className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg max-w-[200px] truncate text-center">
          {eventData?.title || 'Scanner'}
        </h1>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-full transition-colors ${torchOn ? 'text-yellow-300 bg-yellow-400/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
            title={torchOn ? 'Turn off torch' : 'Turn on torch'}
          >
            {torchOn ? <Lightbulb className="w-5 h-5" /> : <LightbulbOff className="w-5 h-5" />}
          </button>
          <button
            onClick={openManualCheckIn}
            className="p-2 text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-full transition-colors"
            title="Manual Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Body: 2-column on desktop ── */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-6 max-w-6xl mx-auto px-4 pt-6 pb-8 lg:px-8">

        {/* LEFT COLUMN: Counter + Camera + Result */}
        <div className="flex flex-col items-center w-full lg:max-w-md lg:shrink-0">
          {/* Live Counter */}
          <div className="w-full mb-4">
            <div className="inline-flex flex-col items-center w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Checked In</span>
              <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]">
                {checkedIn}
                {capacity > 0 && <span className="text-2xl text-gray-500 font-medium"> / {capacity}</span>}
              </div>
              {fillPct !== null && (
                <div className="w-full mt-3 bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fillPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${fillPct >= 80 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-[#00d4ff] to-[#7c3aed]'}`}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Scanner Viewfinder */}
          <div className="w-full relative mb-4 aspect-square">
            <QRScanner onScan={handleScan} />
            {isProcessing && (
              <div className="absolute inset-0 rounded-3xl border-4 border-[#00d4ff]/50 animate-ping pointer-events-none" />
            )}
          </div>

          {/* Scan Result Card */}
          <div className="h-32 w-full relative">
            <AnimatePresence mode="wait">
              {lastScan ? (
                <motion.div
                  key={lastScan.timestamp}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={`w-full h-full p-4 rounded-2xl flex items-start gap-4 border shadow-xl backdrop-blur-md
                    ${lastScan.status === 'checked_in' ? 'bg-green-500/10 border-green-500/30' :
                      lastScan.status === 'already_checked_in' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-red-500/10 border-red-500/30'}
                  `}
                >
                  <div className="mt-0.5 shrink-0">
                    {lastScan.status === 'checked_in' && <CheckCircle2 className="w-8 h-8 text-green-400" />}
                    {lastScan.status === 'already_checked_in' && <AlertCircle className="w-8 h-8 text-yellow-400" />}
                    {lastScan.status === 'error' && <XCircle className="w-8 h-8 text-red-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-lg mb-0.5
                      ${lastScan.status === 'checked_in' ? 'text-green-400' :
                        lastScan.status === 'already_checked_in' ? 'text-yellow-400' :
                        'text-red-500'}
                    `}>
                      {lastScan.status === 'checked_in' ? 'Success!' :
                       lastScan.status === 'already_checked_in' ? 'Duplicate Scan' :
                       'Invalid QR'}
                    </h3>
                    {lastScan.participantName && (
                      <p className="text-white font-medium text-sm truncate">{lastScan.participantName}</p>
                    )}
                    <p className="text-gray-300 text-xs truncate leading-snug">{lastScan.message}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">Scanned at {lastScan.timestamp}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 border border-white/5 rounded-2xl bg-white/[0.02] text-sm gap-1">
                  <p>Point camera at QR code</p>
                  <p className="text-xs text-gray-600">Codes scan automatically</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Scans Log */}
        <div className="w-full mt-6 lg:mt-0 lg:flex-1">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-white/10">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-sm text-gray-300">Recent Scans</h2>
              {recentScans.length > 0 && (
                <span className="ml-auto text-xs text-gray-600">{recentScans.length} scan{recentScans.length !== 1 ? 's' : ''}</span>
              )}
            </div>

            <div className="divide-y divide-white/5 max-h-[520px] overflow-y-auto">
              <AnimatePresence>
                {recentScans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-gray-600 text-sm gap-2">
                    <Clock className="w-8 h-8 opacity-30" />
                    <p>No scans yet</p>
                    <p className="text-xs text-gray-700">Scan history will appear here</p>
                  </div>
                ) : (
                  recentScans.map((scan, i) => {
                    const cfg = scanStatusConfig[scan.status as keyof typeof scanStatusConfig];
                    return (
                      <motion.div
                        key={scan.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i === 0 ? 0 : 0 }}
                        className={`flex items-center gap-3 px-5 py-3.5 border-l-2 ${cfg.rowClass}`}
                      >
                        <div className="shrink-0">{cfg.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold uppercase tracking-wide ${cfg.labelClass}`}>{cfg.label}</p>
                          {scan.participantName && (
                            <p className="text-sm font-medium text-gray-200 truncate">{scan.participantName}</p>
                          )}
                          <p className="text-xs text-gray-500 truncate">{scan.message}</p>
                        </div>
                        <span className="text-[10px] font-mono text-gray-600 shrink-0">{scan.timestamp}</span>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Manual Check-In Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0a0a1a]/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: '100%', scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              className="w-full sm:max-w-md bg-[#13132b] sm:rounded-2xl rounded-t-3xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-bold">Manual Check-In</h2>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-white/10 bg-white/[0.02] shrink-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a1a] border border-white/10 rounded-xl pl-10 pr-4 py-3 placeholder-gray-500 focus:outline-none focus:border-[#00d4ff]/50 transition-colors"
                    autoFocus
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
                    {filteredRegs.map((reg) => {
                      const name = reg.form_data['Full Name'] || reg.form_data['full_name'] || 'Unknown';
                      const email = reg.form_data['Email'] || reg.form_data['email'] || reg.email || '';
                      return (
                        <div key={reg.id} className="p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between group">
                          <div className="truncate pr-4 flex-1">
                            <p className="font-medium truncate text-gray-200">{name}</p>
                            <p className="text-xs text-gray-500 truncate">{email}</p>
                          </div>
                          {reg.checked_in ? (
                            <span className="px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-semibold rounded-lg shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Done
                            </span>
                          ) : (
                            <button
                              onClick={() => handleManualCheckIn(reg.qr_code_id, name)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                            >
                              {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                              Check In
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {filteredRegs.length === 0 && !loadingRegistrations && (
                      <p className="text-center text-gray-500 py-8 text-sm">
                        {searchQuery ? 'No matches found.' : 'No registrations yet.'}
                      </p>
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
