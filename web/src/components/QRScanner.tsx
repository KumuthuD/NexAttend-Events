import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import { CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [camError, setCamError] = useState('');

  useEffect(() => {
    if (!document.getElementById('qr-reader')) return;

    scannerRef.current = new Html5Qrcode("qr-reader");

    scannerRef.current.start(
      { facingMode: "environment" }, // Prefer back camera
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      (decodedText) => onScan(decodedText),
      (errorMessage) => onError?.(errorMessage)
    ).catch(err => {
      console.error("Camera start error:", err);
      setCamError(err?.message || String(err));
    });

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
        }).catch(err => console.error("Error stopping scanner:", err));
      } else {
        scannerRef.current?.clear();
      }
    };
  }, [onScan, onError]);

  return (
    <div className="w-full h-full relative bg-[#0a0a1a]">
      {camError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 bg-[#0a0a1a]/90 backdrop-blur-sm">
          <CameraOff className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-red-400 font-medium text-sm mb-1">Camera Access Blocked</p>
          <p className="text-gray-500 text-xs">{camError}</p>
        </div>
      )}
      <div id="qr-reader" className="w-full h-full overflow-hidden [&>video]:!w-full [&>video]:!h-full [&>video]:!object-cover" />
    </div>
  );
}
