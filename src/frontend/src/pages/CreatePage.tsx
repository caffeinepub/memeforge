import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Camera,
  CameraOff,
  Download,
  Loader2,
  Plus,
  RotateCcw,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCamera } from "../camera/useCamera";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateMemePost } from "../hooks/useQueries";

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

const STICKERS = ["😂", "🔥", "💀", "👀", "🤣", "😭", "🫡", "💯", "🤡", "✨"];
const COLORS = [
  "#ffffff",
  "#ffff00",
  "#ff4444",
  "#44ff44",
  "#4444ff",
  "#ff44ff",
  "#000000",
];

const DEFAULT_LAYERS: TextLayer[] = [
  {
    id: "top",
    text: "TOP TEXT",
    x: 250,
    y: 50,
    fontSize: 36,
    color: "#ffffff",
    bold: true,
    italic: false,
  },
  {
    id: "bottom",
    text: "BOTTOM TEXT",
    x: 250,
    y: 450,
    fontSize: 36,
    color: "#ffffff",
    bold: true,
    italic: false,
  },
];

export function CreatePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [textLayers, setTextLayers] = useState<TextLayer[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState("top");
  const [showCamera, setShowCamera] = useState(false);
  const [caption, setCaption] = useState("");
  const { identity } = useInternetIdentity();
  const createPostMutation = useCreateMemePost();

  const camera = useCamera({ facingMode: "environment" });
  const selectedLayer = textLayers.find((l) => l.id === selectedLayerId);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 500, 500);

    if (bgImage) {
      ctx.drawImage(bgImage, 0, 0, 500, 500);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 500, 500);
      gradient.addColorStop(0, "#1a0a2e");
      gradient.addColorStop(1, "#0a1a3e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 500, 500);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.font = "18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Upload an image or take a photo", 250, 250);
    }

    for (const layer of textLayers) {
      const fontStyle = `${layer.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${layer.fontSize}px Impact, sans-serif`;
      ctx.font = fontStyle;
      ctx.textAlign = "center";
      ctx.fillStyle = layer.color;
      ctx.strokeStyle = layer.color === "#000000" ? "#ffffff" : "#000000";
      ctx.lineWidth = Math.max(2, layer.fontSize / 12);
      ctx.strokeText(layer.text, layer.x, layer.y);
      ctx.fillText(layer.text, layer.x, layer.y);
    }
  }, [bgImage, textLayers]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setBgImage(img);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCameraCapture = async () => {
    const file = await camera.capturePhoto();
    if (!file) {
      toast.error("Failed to capture photo");
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setBgImage(img);
      setShowCamera(false);
      camera.stopCamera();
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleAddSticker = (sticker: string) => {
    const id = `sticker-${Date.now()}`;
    setTextLayers((prev) => [
      ...prev,
      {
        id,
        text: sticker,
        x: 250,
        y: 250,
        fontSize: 60,
        color: "#ffffff",
        bold: false,
        italic: false,
      },
    ]);
    setSelectedLayerId(id);
  };

  const handleAddText = () => {
    const id = `text-${Date.now()}`;
    setTextLayers((prev) => [
      ...prev,
      {
        id,
        text: "New Text",
        x: 250,
        y: 250,
        fontSize: 32,
        color: "#ffffff",
        bold: true,
        italic: false,
      },
    ]);
    setSelectedLayerId(id);
  };

  const updateLayer = (updates: Partial<TextLayer>) => {
    setTextLayers((prev) =>
      prev.map((l) => (l.id === selectedLayerId ? { ...l, ...updates } : l)),
    );
  };

  const handleDownload = () => {
    drawCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "memeforge-creation.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("Meme downloaded! 🔥");
  };

  const handlePostToFeed = async () => {
    if (!identity) {
      toast.error("Please log in to post");
      return;
    }
    drawCanvas();
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      createPostMutation.mutate(
        {
          imageBytes: bytes,
          caption: caption || "My MemeForge creation!",
          tags: ["created", "memeforge"],
        },
        {
          onSuccess: () => toast.success("Posted to feed! 🎉"),
          onError: () => toast.error("Failed to post"),
        },
      );
    }, "image/png");
  };

  const toggleCamera = async () => {
    if (showCamera) {
      await camera.stopCamera();
      setShowCamera(false);
    } else {
      setShowCamera(true);
      await camera.startCamera();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="flex items-center px-4 h-14 max-w-lg mx-auto">
          <h1 className="font-display text-xl font-bold text-gradient">
            Meme Creator
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-4 space-y-4">
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-glow">
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            className="w-full aspect-square"
            data-ocid="create.canvas_target"
          />
        </div>

        {showCamera && (
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <div className="relative" style={{ minHeight: "240px" }}>
              <video
                ref={camera.videoRef}
                className="w-full rounded-2xl"
                playsInline
                muted
                style={{ minHeight: "240px", background: "#000" }}
              />
              <canvas ref={camera.canvasRef} className="hidden" />
              {camera.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
                  <p className="text-sm text-red-400">{camera.error.message}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 p-3">
              <Button
                className="flex-1 gradient-primary border-0"
                onClick={handleCameraCapture}
                disabled={!camera.isActive || camera.isLoading}
                data-ocid="create.upload_button"
              >
                {camera.isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-1" />
                )}
                Capture
              </Button>
              <Button variant="secondary" onClick={toggleCamera}>
                <CameraOff className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            data-ocid="create.upload_button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors"
          >
            <Upload className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Upload</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </button>
          <button
            type="button"
            onClick={toggleCamera}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-accent transition-colors"
          >
            <Camera className="w-5 h-5 text-accent" />
            <span className="text-xs text-muted-foreground">Camera</span>
          </button>
          <button
            type="button"
            onClick={handleAddText}
            className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary transition-colors"
            data-ocid="create.secondary_button"
          >
            <Plus className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted-foreground">Add Text</span>
          </button>
        </div>

        {selectedLayer && (
          <motion.div
            className="bg-card rounded-2xl border border-border p-4 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Edit Text Layer</p>
              <div className="flex gap-1 ml-auto">
                {textLayers.map((l) => (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => setSelectedLayerId(l.id)}
                    className={`px-2 py-0.5 text-xs rounded-lg border transition-colors ${l.id === selectedLayerId ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {l.id.includes("sticker")
                      ? l.text
                      : l.id.charAt(0).toUpperCase() + l.id.slice(1, 6)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setTextLayers((prev) =>
                      prev.filter((l) => l.id !== selectedLayerId),
                    )
                  }
                  className="p-1 rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <Input
              id="layer-text"
              data-ocid="create.input"
              value={selectedLayer.text}
              onChange={(e) => updateLayer({ text: e.target.value })}
              className="bg-muted border-0 font-bold"
              placeholder="Enter text..."
            />

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Font Size: {selectedLayer.fontSize}px
              </p>
              <Slider
                value={[selectedLayer.fontSize]}
                onValueChange={([v]) => updateLayer({ fontSize: v })}
                min={12}
                max={80}
                step={2}
                className="[&>span]:bg-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => updateLayer({ color: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedLayer.color === c ? "border-white scale-110" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateLayer({ bold: !selectedLayer.bold })}
                  className={`w-8 h-8 rounded-lg font-bold text-sm border transition-colors ${selectedLayer.bold ? "bg-primary/20 border-primary text-primary" : "border-border text-muted-foreground"}`}
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => updateLayer({ italic: !selectedLayer.italic })}
                  className={`w-8 h-8 rounded-lg italic text-sm border transition-colors ${selectedLayer.italic ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground"}`}
                >
                  I
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-card rounded-2xl border border-border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Stickers
          </p>
          <div className="flex flex-wrap gap-2">
            {STICKERS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => handleAddSticker(s)}
                className="text-2xl p-2 rounded-xl hover:bg-muted transition-colors active:scale-90"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Input
          data-ocid="create.textarea"
          placeholder="Caption for your post..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-card border-border"
        />

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setBgImage(null);
              setTextLayers(DEFAULT_LAYERS);
            }}
            data-ocid="create.cancel_button"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            className="gradient-primary border-0"
            onClick={handleDownload}
            data-ocid="create.primary_button"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
        <Button
          className="w-full bg-accent/20 border border-accent text-accent hover:bg-accent/30 transition-colors"
          onClick={handlePostToFeed}
          disabled={createPostMutation.isPending}
          data-ocid="create.submit_button"
        >
          {createPostMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Post to Feed
        </Button>
      </main>
    </div>
  );
}
