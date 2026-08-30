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
    let stream: MediaStream | undefined;
    let cancelled = false;
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]);
    const reader = new BrowserMultiFormatReader(hints);
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
    }).then(async s => {
      if (cancelled) { s.getTracks().forEach(t => t.stop()); return; }
      stream = s;
      const track = s.getVideoTracks()[0];
      try { await track.applyConstraints({ advanced: [{ focusMode: 'continuous' } as MediaTrackConstraintSet] }); } catch { /* not supported, ignore */ }
      const c = await reader.decodeFromStream(s, videoRef.current!, (result) => {
        if (!result || cancelled) return;
        const text = result.getText();
        if (!/^97[89]/.test(text)) return;
        cancelled = true; c.stop(); onDetectRef.current(text);
      });
      if (cancelled) c.stop(); else controls = c;
    }).catch(() => setError('Could not access the camera. Check your browser permissions.'));
    return () => { cancelled = true; controls?.stop(); stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  return <div className="overlay">
    <div className="camera-modal">
      <button className="icon close" onClick={onClose} aria-label="Close scanner"><X /></button>
      {error ? <p className="error">{error}</p> : <video ref={videoRef} autoPlay playsInline muted />}
      <p className="hint">Point your camera at the barcode on the back of the book.</p>
    </div>
  </div>;
}
