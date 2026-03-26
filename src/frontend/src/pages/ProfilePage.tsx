import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit3, Grid3X3, Loader2, LogIn, LogOut, Save, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { MemeProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerProfile,
  useGetMemesByUser,
  useSaveProfile,
} from "../hooks/useQueries";

export function ProfilePage() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerProfile();
  const principalStr = identity?.getPrincipal().toString() ?? null;
  const { data: userMemes } = useGetMemesByUser(principalStr);
  const saveProfileMutation = useSaveProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<MemeProfile>({
    username: "",
    bio: "",
    avatarUrl: "",
  });

  const openEdit = () => {
    setEditForm({
      username: profile?.username || "",
      bio: profile?.bio || "",
      avatarUrl: profile?.avatarUrl || "",
    });
    setEditOpen(true);
  };

  const handleSave = () => {
    saveProfileMutation.mutate(editForm, {
      onSuccess: () => {
        toast.success("Profile saved!");
        setEditOpen(false);
      },
      onError: () => toast.error("Failed to save profile"),
    });
  };

  const displayName =
    profile?.username ||
    (principalStr ? `${principalStr.slice(0, 12)}...` : "Guest");
  const avatarSeed = principalStr || "guest";

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-lg mx-auto">
          <h1 className="font-display text-xl font-bold text-gradient">
            Profile
          </h1>
          {identity ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-muted-foreground hover:text-destructive"
              data-ocid="profile.secondary_button"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          ) : null}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-6 space-y-6">
        <motion.div
          className="bg-card rounded-2xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={
                  profile?.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
                }
              />
              <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {profileLoading ? (
                  <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                ) : (
                  <h2 className="font-display text-xl font-bold truncate">
                    {displayName}
                  </h2>
                )}
                {identity && (
                  <Badge className="gradient-primary border-0 text-xs">
                    Member
                  </Badge>
                )}
              </div>
              {profile?.bio ? (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.bio}
                </p>
              ) : identity ? (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  No bio yet. Add one!
                </p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">Guest user</p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="font-bold text-sm">{userMemes?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Memes</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">
                    {userMemes?.reduce(
                      (acc, m) => acc + Number(m.likesCount),
                      0,
                    ) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
              </div>
            </div>
          </div>

          {identity ? (
            <Button
              variant="secondary"
              className="w-full mt-4"
              onClick={openEdit}
              data-ocid="profile.edit_button"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="mt-4 space-y-2">
              <div className="bg-muted/50 rounded-xl p-3 text-center text-sm text-muted-foreground">
                🔒 Log in to like, comment, and post memes
              </div>
              <Button
                className="w-full gradient-primary border-0 shadow-glow"
                onClick={login}
                disabled={isLoggingIn}
                data-ocid="profile.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                {isLoggingIn ? "Logging in..." : "Log In"}
              </Button>
            </div>
          )}
        </motion.div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Grid3X3 className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-bold">
              {identity ? "Your Memes" : "Popular Memes"}
            </h2>
          </div>
          {!identity ? (
            <div className="text-center py-8" data-ocid="profile.empty_state">
              <p className="text-4xl mb-2">🔒</p>
              <p className="text-muted-foreground text-sm">
                Log in to see your memes
              </p>
            </div>
          ) : userMemes && userMemes.length > 0 ? (
            <div className="grid grid-cols-3 gap-1.5">
              {userMemes.map((m, i) => (
                <motion.div
                  key={m.id.toString()}
                  data-ocid={`profile.item.${i + 1}`}
                  className="aspect-square rounded-xl overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <img
                    src={m.imageUrl.getDirectURL()}
                    alt={m.caption}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8" data-ocid="profile.empty_state">
              <p className="text-4xl mb-2">🖼️</p>
              <p className="text-muted-foreground text-sm">
                No memes yet. Start creating!
              </p>
            </div>
          )}
        </section>
      </main>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="bg-card border-border max-w-sm"
          data-ocid="profile.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-gradient">
              Edit Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="edit-username"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Username
              </label>
              <Input
                id="edit-username"
                data-ocid="profile.input"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, username: e.target.value }))
                }
                placeholder="Your username"
                className="bg-muted border-0"
              />
            </div>
            <div>
              <label
                htmlFor="edit-bio"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Bio
              </label>
              <Textarea
                id="edit-bio"
                data-ocid="profile.textarea"
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, bio: e.target.value }))
                }
                placeholder="Tell everyone about yourself..."
                className="bg-muted border-0 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label
                htmlFor="edit-avatar"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Avatar URL
              </label>
              <Input
                id="edit-avatar"
                value={editForm.avatarUrl}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, avatarUrl: e.target.value }))
                }
                placeholder="https://..."
                className="bg-muted border-0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setEditOpen(false)}
                data-ocid="profile.cancel_button"
              >
                <X className="w-4 h-4 mr-1" /> Cancel
              </Button>
              <Button
                className="flex-1 gradient-primary border-0"
                onClick={handleSave}
                disabled={saveProfileMutation.isPending}
                data-ocid="profile.save_button"
              >
                {saveProfileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
