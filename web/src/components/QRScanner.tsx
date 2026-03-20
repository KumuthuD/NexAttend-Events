import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [camError, setCamError] = useState('');

  // Use refs for callbacks to prevent useEffect from re-triggering when parent state changes
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isUnmounted = false;

    const initScanner = async () => {
      // Small delay to let React 18 strict mode unmount the first ghost component
      await new Promise(resolve => setTimeout(resolve, 100));
      if (isUnmounted) return;

      if (!document.getElementById('qr-reader')) return;

      html5QrCode = new Html5Qrcode("qr-reader", {
        formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ],
        verbose: false
      });

      html5QrCode.start(
        { facingMode: "environment" }, // Prefer back camera
        {
          fps: 10,
        },
        (decodedText) => onScanRef.current(decodedText),
        (errorMessage) => onErrorRef.current?.(errorMessage)
      ).catch(err => {
        console.error("Camera start error:", err);
        if (!isUnmounted) setCamError(err?.message || String(err));
      });
    };

    initScanner();

    return () => {
      isUnmounted = true;
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode?.clear();
          }).catch(err => console.error("Error stopping scanner:", err));
        } else {
          html5QrCode.clear();
        }
      }
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-[#0a0a1a] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,212,255,0.1)]">
      {camError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-[#0a0a1a]/90 backdrop-blur-sm">
          <CameraOff className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-red-400 font-medium text-sm mb-1">Camera Access Blocked</p>
          <p className="text-gray-500 text-xs">{camError}</p>
        </div>
      )}
      {/* We must NOT force object-cover on the internal video, as it breaks the library's coordinate mapping. */}
      <div id="qr-reader" className="w-full h-full flex items-center justify-center border-0" />
      
      {/* Viewfinder overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="w-full h-full border-[20px] sm:border-[40px] border-black/50 relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00d4ff] -translate-x-1 -translate-y-1"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00d4ff] translate-x-1 -translate-y-1"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00d4ff] -translate-x-1 translate-y-1"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00d4ff] translate-x-1 translate-y-1"></div>
        </div>
      </div>
    </div>
  );
}
