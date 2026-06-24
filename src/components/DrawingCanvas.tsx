import { useRef, useState, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { doodleDb } from "@/lib/firebase";

const PALETTE = [
  { label: "Ink", value: "#2a2118" },
  { label: "Clay", value: "#6b5c46" },
  { label: "Red", value: "#c0392b" },
  { label: "Blue", value: "#2471a3" },
  { label: "Moss", value: "#1e8449" },
  { label: "Orange", value: "#d4622a" },
  { label: "Yellow", value: "#d4ac0d" },
  { label: "White", value: "#fffdf8" },
];

const SIZES = [2, 5, 10];

type NewDoodle = { imageUrl: string; caption: string; rot: number };

export function DrawingCanvas({ onSave }: { onSave: (d: NewDoodle) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const [color, setColor] = useState("#2a2118");
  const [size, setSize] = useState(5);
  const [eraser, setEraser] = useState(false);
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, []);

  function relPos(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const canvas = canvasRef.current!;
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  function strokeTo(pos: { x: number; y: number }) {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
    ctx.strokeStyle = eraser ? "rgba(0,0,0,1)" : color;
    ctx.lineWidth = eraser ? size * 4 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    if (lastPos.current) ctx.moveTo(lastPos.current.x, lastPos.current.y);
    else ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  }

  function onMouseDown(e: React.MouseEvent) {
    drawing.current = true;
    strokeTo(relPos(e.nativeEvent));
  }
  function onMouseMove(e: React.MouseEvent) {
    if (drawing.current) strokeTo(relPos(e.nativeEvent));
  }
  function onMouseUp() {
    drawing.current = false;
    lastPos.current = null;
  }

  function onTouchStart(e: React.TouchEvent) {
    e.preventDefault();
    drawing.current = true;
    strokeTo(relPos(e.touches[0]));
  }
  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (drawing.current) strokeTo(relPos(e.touches[0]));
  }
  function onTouchEnd() {
    drawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fffdf8";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  async function pinToWall() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setStatus("saving");
    try {
      const imageUrl = canvas.toDataURL("image/jpeg", 0.85);
      const rot = parseFloat((Math.random() * 4 - 2).toFixed(1));
      const cap = caption.trim() || "untitled";
      await addDoc(collection(doodleDb, "doodles"), {
        imageUrl,
        caption: cap,
        rot,
        createdAt: serverTimestamp(),
      });
      onSave({ imageUrl, caption: cap, rot });
      setStatus("saved");
      setCaption("");
      clearCanvas();
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Toolbar — two rows so nothing clips on small screens */}
      <div className="flex flex-col gap-2 shrink-0">
        {/* Row 1: colors */}
        <div className="flex gap-2 flex-wrap">
          {PALETTE.map((c) => (
            <button
              key={c.value}
              onClick={() => { setColor(c.value); setEraser(false); }}
              title={c.label}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{
                background: c.value,
                boxShadow:
                  color === c.value && !eraser
                    ? "0 0 0 2px #fffdf8, 0 0 0 3px #2a2118"
                    : c.value === "#fffdf8"
                      ? "inset 0 0 0 1px #ccc"
                      : "none",
              }}
            />
          ))}
        </div>
        {/* Row 2: sizes + tools */}
        <div className="flex items-center gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => { setSize(s); setEraser(false); }}
              title={`Size ${s}`}
              className="rounded-full bg-foreground hover:opacity-70 transition-opacity shrink-0"
              style={{
                width: s * 2 + 10,
                height: s * 2 + 10,
                boxShadow: size === s && !eraser ? "0 0 0 2px #fffdf8, 0 0 0 3px #2a2118" : "none",
              }}
            />
          ))}
          <div className="w-px h-4 bg-border mx-1" />
          <button
            onClick={() => setEraser(!eraser)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${eraser ? "bg-foreground text-background border-foreground" : "border-border hover:bg-card"}`}
          >
            eraser
          </button>
          <button
            onClick={clearCanvas}
            className="px-3 py-1 text-xs rounded-full border border-border hover:bg-card transition-colors"
          >
            clear
          </button>
        </div>
      </div>

      {/* Canvas — fills all remaining space */}
      <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-border" style={{ background: "#fffdf8" }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full h-full touch-none"
          style={{ cursor: eraser ? "cell" : "crosshair", display: "block" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>

      {/* Caption + save */}
      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pinToWall()}
          placeholder="give it a name..."
          maxLength={60}
          className="flex-1 min-w-0 px-4 py-2 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={pinToWall}
          disabled={status === "saving"}
          className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-clay transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {status === "saving" ? "pinning…" : status === "saved" ? "pinned! ◣" : status === "error" ? "failed" : "pin →"}
        </button>
      </div>
    </div>
  );
}
