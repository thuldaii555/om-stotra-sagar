import { useRef, useState, useEffect, useCallback, type PointerEvent, type WheelEvent } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface Props {
  src: string;
  aspectRatio?: number | null;
  outputSize?: { w: number; h: number };
  onDone: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({ src, aspectRatio = null, outputSize = { w: 600, h: 400 }, onDone, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });

  const CANVAS_W = 340;
  const CANVAS_H = aspectRatio ? Math.round(CANVAS_W / aspectRatio) : 220;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const scale = zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = CANVAS_W / 2 - drawW / 2 + offset.x;
    const y = CANVAS_H / 2 - drawH / 2 + offset.y;
    ctx.drawImage(img, x, y, drawW, drawH);

    ctx.strokeStyle = 'rgba(212,160,23,0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, CANVAS_W - 2, CANVAS_H - 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(CANVAS_W * i / 3, 0); ctx.lineTo(CANVAS_W * i / 3, CANVAS_H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, CANVAS_H * i / 3); ctx.lineTo(CANVAS_W, CANVAS_H * i / 3); ctx.stroke();
    }
  }, [zoom, offset, CANVAS_W, CANVAS_H]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const fitZoom = Math.min(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
      setZoom(fitZoom);
      setOffset({ x: 0, y: 0 });
    };
    img.src = src;
  }, [src, CANVAS_W, CANVAS_H]);

  useEffect(() => { draw(); }, [draw]);

  const onPointerDown = (e: PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    setOffset({ x: dragStart.current.ox + dx, y: dragStart.current.oy + dy });
  };
  const onPointerUp = () => setDragging(false);

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.1, Math.min(5, z - e.deltaY * 0.001)));
  };

  const handleDone = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const out = document.createElement('canvas');
    out.width = outputSize.w;
    out.height = outputSize.h;
    const ctx = out.getContext('2d')!;
    const scaleX = outputSize.w / CANVAS_W;
    const scaleY = outputSize.h / CANVAS_H;
    const drawW = img.naturalWidth * zoom * scaleX;
    const drawH = img.naturalHeight * zoom * scaleY;
    const x = outputSize.w / 2 - drawW / 2 + offset.x * scaleX;
    const y = outputSize.h / 2 - drawH / 2 + offset.y * scaleY;
    ctx.fillStyle = '#1a1410';
    ctx.fillRect(0, 0, outputSize.w, outputSize.h);
    ctx.drawImage(img, x, y, drawW, drawH);
    onDone(out.toDataURL('image/jpeg', 0.88));
  };

  return (
    <div className="img-cropper-wrap">
      <p className="img-cropper-hint">Drag to reposition · Scroll to zoom</p>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="img-cropper-canvas"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
      <div className="img-cropper-toolbar">
        <button onClick={() => setZoom(z => Math.min(5, z + 0.15))} className="cropper-btn" title="Zoom in">
          <ZoomIn size={16} />
        </button>
        <button onClick={() => setZoom(z => Math.max(0.1, z - 0.15))} className="cropper-btn" title="Zoom out">
          <ZoomOut size={16} />
        </button>
        <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="cropper-btn" title="Reset">
          <RotateCcw size={16} />
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={onCancel} className="cropper-btn cropper-btn-cancel" title="Cancel">
          <X size={16} />
        </button>
        <button onClick={handleDone} className="cropper-btn cropper-btn-done" title="Use this crop">
          <Check size={16} /> Use image
        </button>
      </div>
    </div>
  );
}
