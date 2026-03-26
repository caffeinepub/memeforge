import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useGenerateMemes } from "../hooks/useQueries";

const STYLES = [
  {
    id: "funny",
    label: "😂 Funny",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    id: "sarcastic",
    label: "😏 Sarcastic",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "wholesome",
    label: "🥰 Wholesome",
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
  {
    id: "dark",
    label: "💀 Dark Humor",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  {
    id: "trending",
    label: "🔥 Trending",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
];

const SAMPLE_IMAGES = [
  "https://i.imgflip.com/1bij.jpg",
  "https://i.imgflip.com/26am.jpg",
  "https://i.imgflip.com/9ehk.jpg",
  "https://i.imgflip.com/1otk96.jpg",
  "https://i.imgflip.com/3oevdk.jpg",
];

interface MemeSuggestion {
  id: number;
  topText: string;
  bottomText: string;
  style: string;
  description: string;
}

function parseMemeSuggestions(jsonStr: string): MemeSuggestion[] {
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      return parsed.map((item, i) => ({
        id: i,
        topText: item.topText || item.top_text || item.title || "",
        bottomText: item.bottomText || item.bottom_text || item.caption || "",
        style: item.style || item.type || "funny",
        description: item.description || item.text || "",
      }));
    }
    const firstKey = Object.keys(parsed)[0];
    if (firstKey && Array.isArray(parsed[firstKey])) {
      return parseMemeSuggestions(JSON.stringify(parsed[firstKey]));
    }
  } catch {
    // not valid JSON
  }
  return [];
}

export function AIGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("funny");
  const [suggestions, setSuggestions] = useState<MemeSuggestion[]>([]);
  const generateMutation = useGenerateMemes();

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please describe the meme you want");
      return;
    }
    const fullPrompt = `Style: ${selectedStyle}. Theme: ${prompt}`;
    generateMutation.mutate(fullPrompt, {
      onSuccess: (result) => {
        const parsed = parseMemeSuggestions(result);
        if (parsed.length === 0) {
          const fallback: MemeSuggestion[] = SAMPLE_IMAGES.slice(0, 4).map(
            (_, i) => ({
              id: i,
              topText: `${selectedStyle.toUpperCase()} MEME ${i + 1}`,
              bottomText: prompt.slice(0, 50),
              style: selectedStyle,
              description: result.slice(0, 100),
            }),
          );
          setSuggestions(fallback);
        } else {
          setSuggestions(parsed.slice(0, 5));
        }
      },
      onError: () => toast.error("Generation failed. Try again!"),
    });
  };

  const handleUseThis = (suggestion: MemeSuggestion) => {
    toast.success("Meme idea copied! Head to Create to make it.");
    localStorage.setItem(
      "memeforge_suggestion",
      JSON.stringify({
        topText: suggestion.topText,
        bottomText: suggestion.bottomText,
      }),
    );
  };

  const handleDownload = (
    imageUrl: string,
    topText: string,
    bottomText: string,
  ) => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 500, 500);
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.font = "bold 36px Impact, sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(topText.toUpperCase(), 250, 50);
      ctx.fillText(topText.toUpperCase(), 250, 50);
      ctx.strokeText(bottomText.toUpperCase(), 250, 475);
      ctx.fillText(bottomText.toUpperCase(), 250, 475);
      const link = document.createElement("a");
      link.download = "meme.png";
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = imageUrl;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="flex items-center px-4 h-14 max-w-lg mx-auto">
          <h1 className="font-display text-xl font-bold text-gradient">
            AI Meme Generator
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 gradient-primary rounded-3xl flex items-center justify-center mx-auto shadow-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground text-sm">
            Describe your meme idea and our AI will generate 4–5 unique meme
            concepts for you.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Select Style
          </p>
          <div className="flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                type="button"
                key={s.id}
                data-ocid={`ai.${s.id}.tab`}
                onClick={() => setSelectedStyle(s.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  selectedStyle === s.id
                    ? `${s.color} scale-105 shadow-glow`
                    : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            data-ocid="ai.textarea"
            placeholder="e.g. 'A cat who acts like it owns the house and treats humans as servants'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-card border-border resize-none text-sm"
            rows={4}
          />
          <Button
            data-ocid="ai.primary_button"
            className="w-full gradient-primary border-0 shadow-glow h-12 text-base font-bold"
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Memes...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Memes
              </>
            )}
          </Button>
        </div>

        {generateMutation.isPending && (
          <div className="space-y-3" data-ocid="ai.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        <AnimatePresence>
          {suggestions.length > 0 && !generateMutation.isPending && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="ai.success_state"
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-lg font-bold">
                  Generated Memes
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  className="text-primary"
                  data-ocid="ai.secondary_button"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </div>
              {suggestions.map((s, i) => {
                const imgUrl = SAMPLE_IMAGES[i % SAMPLE_IMAGES.length];
                return (
                  <motion.div
                    key={s.id}
                    data-ocid={`ai.item.${i + 1}`}
                    className="bg-card rounded-2xl overflow-hidden border border-border"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="relative">
                      <img
                        src={imgUrl}
                        alt="Meme template"
                        className="w-full aspect-square object-cover"
                      />
                      {s.topText && (
                        <p
                          className="absolute top-2 left-0 right-0 text-center font-bold text-white text-xl px-3 leading-tight"
                          style={{
                            textShadow:
                              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                            fontFamily: "Impact, sans-serif",
                          }}
                        >
                          {s.topText.toUpperCase()}
                        </p>
                      )}
                      {s.bottomText && (
                        <p
                          className="absolute bottom-2 left-0 right-0 text-center font-bold text-white text-xl px-3 leading-tight"
                          style={{
                            textShadow:
                              "2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000",
                            fontFamily: "Impact, sans-serif",
                          }}
                        >
                          {s.bottomText.toUpperCase()}
                        </p>
                      )}
                      <Badge className="absolute top-2 right-2 text-xs capitalize">
                        {s.style}
                      </Badge>
                    </div>
                    {s.description && (
                      <p className="px-4 py-2 text-xs text-muted-foreground">
                        {s.description}
                      </p>
                    )}
                    <div className="flex gap-2 p-3">
                      <Button
                        variant="secondary"
                        className="flex-1 text-xs"
                        onClick={() =>
                          handleDownload(imgUrl, s.topText, s.bottomText)
                        }
                        data-ocid={`ai.item.${i + 1}.secondary_button`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        className="flex-1 gradient-primary border-0 text-xs"
                        onClick={() => handleUseThis(s)}
                        data-ocid={`ai.item.${i + 1}.primary_button`}
                      >
                        Use This 🔥
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
