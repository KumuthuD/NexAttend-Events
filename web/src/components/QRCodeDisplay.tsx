import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ value, size = 256 }) => {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector('canvas');
    if (!canvas) return;

    const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `Event-Ticket-${value}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div 
        ref={qrRef} 
        className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#00d4ff]/20"
      >
        <QRCodeCanvas 
          value={value} 
          size={size}
          bgColor={"#ffffff"}
          fgColor={"#0a0a1a"}
          level={"H"}
          includeMargin={true}
        />
      </div>
      <button 
        onClick={downloadQR}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] hover:opacity-90 transition-all font-medium rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]"
      >
        <Download size={18} />
        Download QR Code
      </button>
    </div>
  );
};

export default QRCodeDisplay;
