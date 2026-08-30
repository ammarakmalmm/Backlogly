import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { X } from 'lucide-react';

export function BarcodeScanner({ onDetect, onClose }: { onDetect: (isbn: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onDetectRef = useRef(onDetect);
  onDetectRef.current = onDetect;
  const [error, setError] = useState('');

  useEffect(() => {
    let controls: IScannerControls | undefined;
    let cancelled = false;
    let lastText: string | null = null;
    let streak = 0;
    const REQUIRED_MATCHES = 2;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
    const reader = new BrowserMultiFormatReader(hints);
    reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
      if (!result || cancelled) return;
      const text = result.getText();
      if (!/^97[89]/.test(text)) return;
      streak = text === lastText ? streak + 1 : 1;
      lastText = text;
      if (streak >= REQUIRED_MATCHES) { cancelled = true; controls?.stop(); onDetectRef.current(text); }
    }).then(c => { if (cancelled) c.stop(); else controls = c }).catch(() => setError('Could not access the camera. Check your browser permissions.'));
    return () => { cancelled = true; controls?.stop(); };
  }, []);

  return <div className="overlay">
    <div className="camera-modal">
      <button className="icon close" onClick={onClose} aria-label="Close scanner"><X /></button>
      {error ? <p className="error">{error}</p> : <video ref={videoRef} autoPlay playsInline muted />}
      <p className="hint">Point your camera at the barcode on the back of the book.</p>
    </div>
  </div>;
}
