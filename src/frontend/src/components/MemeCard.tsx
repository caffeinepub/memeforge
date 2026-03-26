import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Bookmark,
  Copy,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddComment,
  useGetCommentsForMeme,
  useLikeMeme,
} from "../hooks/useQueries";

export interface DisplayMeme {
  id: string;
  backendId?: bigint;
  imageUrl: string;
  caption: string;
  tags: string[];
  likesCount: number;
  creatorId: string;
  creatorName: string;
}

interface MemeCardProps {
  meme: DisplayMeme;
  index: number;
}

export function MemeCard({ meme, index }: MemeCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localLikes, setLocalLikes] = useState(meme.likesCount);
  const [liked, setLiked] = useState(false);
  const { identity } = useInternetIdentity();
  const likeMutation = useLikeMeme();
  const addCommentMutation = useAddComment();
  const commentsQuery = useGetCommentsForMeme(
    showComments && meme.backendId != null ? meme.backendId : null,
  );

  const handleLike = () => {
    if (!identity) {
      toast.error("Please log in to like memes");
      return;
    }
    if (meme.backendId != null) {
      likeMutation.mutate(meme.backendId);
    }
    setLiked((prev) => !prev);
    setLocalLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleComment = () => {
    if (!identity) {
      toast.error("Please log in to comment");
      return;
    }
    setShowComments((prev) => !prev);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    if (!meme.backendId) {
      toast.info("Comments not available for this meme");
      return;
    }
    addCommentMutation.mutate(
      { memeId: meme.backendId, text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          toast.success("Comment posted!");
        },
        onError: () => toast.error("Failed to post comment"),
      },
    );
  };

  const shareUrl = window.location.href;
  const shareText = `Check out this meme on MemeForge! ${shareUrl}`;

  const handleShareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareText)}`,
      "_blank",
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const handleShareMore = () => {
    if (navigator.share) {
      navigator
        .share({
          title: meme.caption,
          text: "Check out this meme on MemeForge!",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  return (
    <motion.article
      data-ocid={`feed.item.${index}`}
      className="bg-card rounded-2xl overflow-hidden border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
        <Avatar className="w-9 h-9">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${meme.creatorId}`}
          />
          <AvatarFallback className="bg-primary/20 text-primary text-xs">
            {meme.creatorName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{meme.creatorName}</p>
        </div>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <Bookmark className="w-4 h-4" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={meme.imageUrl}
          alt={meme.caption}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            data-ocid={`feed.item.${index}.toggle`}
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${liked ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} />
            <span>{localLikes}</span>
          </motion.button>
          <button
            type="button"
            data-ocid={`feed.item.${index}.button`}
            onClick={handleComment}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </button>

          {/* Share dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                data-ocid={`feed.item.${index}.dropdown_menu`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-all ml-auto"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-card border-border min-w-[160px]"
            >
              <DropdownMenuItem
                onClick={handleShareWhatsApp}
                className="flex items-center gap-2 cursor-pointer"
              >
                <SiWhatsapp className="w-4 h-4 text-green-400" />
                <span>WhatsApp</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyLink}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleShareMore}
                className="flex items-center gap-2 cursor-pointer"
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>More</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-foreground">{meme.caption}</p>

        {meme.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {meme.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2 border-t border-border">
                {commentsQuery.isLoading && (
                  <p className="text-xs text-muted-foreground">
                    Loading comments...
                  </p>
                )}
                {commentsQuery.data?.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No comments yet. Be first!
                  </p>
                )}
                {commentsQuery.data?.map((c) => (
                  <div key={c.timestamp.toString()} className="flex gap-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {c.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-xs font-semibold text-primary">
                        {c.authorName}
                      </span>
                      <p className="text-xs text-foreground">{c.text}</p>
                    </div>
                  </div>
                ))}
                <div
                  className="flex gap-2 mt-2"
                  data-ocid={`feed.item.${index}.input`}
                >
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSubmitComment()
                    }
                    className="h-8 text-xs bg-muted border-0"
                  />
                  <Button
                    size="sm"
                    className="h-8 gradient-primary border-0 text-xs"
                    onClick={handleSubmitComment}
                    disabled={addCommentMutation.isPending}
                    data-ocid={`feed.item.${index}.submit_button`}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}
