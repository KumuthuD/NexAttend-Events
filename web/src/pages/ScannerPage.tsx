import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEvent, checkIn } from '../services/api';
import QRScanner from '../components/QRScanner';
import { CheckCircle2, AlertCircle, XCircle, ChevronLeft, Search, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans flex flex-col items-center">
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
        <button className="p-2 -mr-2 text-[#00d4ff] hover:bg-[#00d4ff]/10 rounded-full transition-colors">
          <Search className="w-5 h-5" />
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
        <div className="w-full aspect-square rounded-3xl overflow-hidden border-2 border-white/20 relative shadow-[0_0_40px_rgba(0,212,255,0.1)] mb-6">
          <QRScanner onScan={handleScan} />
          
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full border-[40px] border-black/40 relative">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00d4ff] -translate-x-1 -translate-y-1"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00d4ff] translate-x-1 -translate-y-1"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00d4ff] -translate-x-1 translate-y-1"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00d4ff] translate-x-1 translate-y-1"></div>
            </div>
            
            <motion.div 
              animate={{ y: [0, 250, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute left-10 right-10 top-10 h-0.5 bg-[#00d4ff] shadow-[0_0_8px_#00d4ff]"
            />
          </div>
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
    </div>
  );
}
