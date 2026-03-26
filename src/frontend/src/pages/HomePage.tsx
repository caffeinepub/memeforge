import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image, Loader2, Plus, Share2, X } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { MemePost } from "../backend";
import { type DisplayMeme, MemeCard } from "../components/MemeCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCreateMemePost, useGetAllMemes } from "../hooks/useQueries";

function memePostToDisplay(m: MemePost): DisplayMeme {
  return {
    id: m.id.toString(),
    backendId: m.id,
    imageUrl: m.imageUrl.getDirectURL(),
    caption: m.caption,
    tags: m.tags,
    likesCount: Number(m.likesCount),
    creatorId: m.creatorId.toString(),
    creatorName: `${m.creatorId.toString().slice(0, 8)}...`,
  };
}

export function HomePage() {
  const { data: backendMemes, isLoading } = useGetAllMemes();
  const { identity } = useInternetIdentity();
  const createPostMutation = useCreateMemePost();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tagInput, setTagInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayMemes: DisplayMeme[] = backendMemes
    ? backendMemes.map(memePostToDisplay)
    : [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handlePost = async () => {
    if (!identity) {
      toast.error("Please log in to post memes");
      return;
    }
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }
    const arrayBuffer = await selectedFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    createPostMutation.mutate(
      { imageBytes: bytes, caption, tags },
      {
        onSuccess: () => {
          toast.success("Meme posted! 🔥");
          setUploadOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
          setCaption("");
          setTagInput("");
        },
        onError: (err) => toast.error(err.message || "Failed to post"),
      },
    );
  };

  const handleShareApp = () => {
    const url = window.location.origin;
    const text = `Check out MemeForge – a meme creation & sharing app! ${url}`;
    if (navigator.share) {
      navigator.share({ title: "MemeForge", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      toast.success("App link copied! Share it with friends 🔥");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/memeforge-logo-transparent.dim_400x400.png"
              alt="MemeForge"
              className="w-8 h-8 object-contain"
            />
            <div>
              <span className="font-display text-lg font-bold text-gradient block leading-none">
                MemeForge
              </span>
              <button
                type="button"
                data-ocid="home.share_app_button"
                onClick={handleShareApp}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                Share with friends
              </button>
            </div>
          </div>
          <button
            type="button"
            data-ocid="home.upload_button"
            onClick={() => {
              if (!identity) {
                toast.error("Please log in to post memes");
                return;
              }
              setUploadOpen(true);
            }}
            className="gradient-primary text-white rounded-xl px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Post
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-4 space-y-4">
        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="feed.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : displayMemes.length === 0 ? (
          <motion.div
            data-ocid="feed.empty_state"
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-4xl mb-3">😂</p>
            <p className="text-muted-foreground">
              No memes yet. Be the first to forge one!
            </p>
            <button
              type="button"
              onClick={handleShareApp}
              className="mt-4 text-sm text-primary underline underline-offset-2"
            >
              Invite friends to join →
            </button>
          </motion.div>
        ) : (
          displayMemes.map((meme, i) => (
            <MemeCard key={meme.id} meme={meme} index={i + 1} />
          ))
        )}
      </main>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm mx-auto"
          data-ocid="home.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-gradient">
              Post a Meme
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-xl aspect-square object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                data-ocid="home.dropzone"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-colors bg-muted/30"
              >
                <Image className="w-10 h-10 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Tap to select image
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </button>
            )}
            <Textarea
              data-ocid="home.textarea"
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-muted border-0 resize-none"
              rows={3}
            />
            <Input
              data-ocid="home.input"
              placeholder="Tags (comma-separated): funny, relatable"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="bg-muted border-0"
            />
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setUploadOpen(false)}
                data-ocid="home.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gradient-primary border-0"
                onClick={handlePost}
                disabled={!selectedFile || createPostMutation.isPending}
                data-ocid="home.submit_button"
              >
                {createPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 mr-1" />
                )}
                {createPostMutation.isPending ? "Posting..." : "Post Meme"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
