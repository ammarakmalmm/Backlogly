import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

export function CameraCapture({ onCapture, onClose }: { onCapture: (dataUrl: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | undefined;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => { stream = s; if (videoRef.current) videoRef.current.srcObject = s; })
      .catch(() => setError('Could not access the camera. Check your browser permissions.'));
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext('2d')!.drawImage(video, 0, 0);
    onCapture(c.toDataURL('image/webp', 0.8));
  };

  return <div className="overlay">
    <div className="camera-modal">
      <button className="icon close" onClick={onClose} aria-label="Close camera"><X /></button>
      {error ? <p className="error">{error}</p> : <video ref={videoRef} autoPlay playsInline muted />}
      <button className="primary" onClick={capture} disabled={!!error}><Camera size={18} /> Capture</button>
    </div>
  </div>;
}
