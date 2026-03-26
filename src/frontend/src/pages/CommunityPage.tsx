import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { MemePost } from "../backend";
import { useGetAllMemes } from "../hooks/useQueries";

interface Creator {
  id: string;
  name: string;
  memeCount: number;
  totalLikes: number;
  seed: string;
}

const SAMPLE_CREATORS: Creator[] = [
  {
    id: "alice",
    name: "Alice Wonder",
    memeCount: 47,
    totalLikes: 18400,
    seed: "alice",
  },
  {
    id: "bobjokes",
    name: "Bob Jokes",
    memeCount: 32,
    totalLikes: 9200,
    seed: "bob",
  },
  {
    id: "nightowl",
    name: "Night Owl",
    memeCount: 89,
    totalLikes: 41300,
    seed: "nightowl",
  },
  {
    id: "codegod99",
    name: "Code God",
    memeCount: 124,
    totalLikes: 62800,
    seed: "codegod",
  },
  {
    id: "officememer",
    name: "Office Memer",
    memeCount: 56,
    totalLikes: 22100,
    seed: "office",
  },
  {
    id: "dankmaster",
    name: "Dank Master",
    memeCount: 213,
    totalLikes: 98500,
    seed: "dank",
  },
];

const SAMPLE_TRENDING: {
  imageUrl: string;
  caption: string;
  likes: number;
  id: string;
}[] = [
  {
    id: "t1",
    imageUrl: "https://i.imgflip.com/9ehk.jpg",
    caption: "My brain at 3am",
    likes: 9341,
  },
  {
    id: "t2",
    imageUrl: "https://i.imgflip.com/1otk96.jpg",
    caption: "Quick fix they said",
    likes: 7612,
  },
  {
    id: "t3",
    imageUrl: "https://i.imgflip.com/26am.jpg",
    caption: "Explaining to the boss",
    likes: 5102,
  },
  {
    id: "t4",
    imageUrl: "https://i.imgflip.com/3oevdk.jpg",
    caption: "Monday vs Friday",
    likes: 3987,
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function CommunityPage() {
  const [search, setSearch] = useState("");
  const { data: allMemes } = useGetAllMemes();

  const buildCreatorsFromMemes = (memes: MemePost[]): Creator[] => {
    const map = new Map<string, { count: number; likes: number }>();
    for (const m of memes) {
      const key = m.creatorId.toString();
      const cur = map.get(key) || { count: 0, likes: 0 };
      map.set(key, {
        count: cur.count + 1,
        likes: cur.likes + Number(m.likesCount),
      });
    }
    return Array.from(map.entries())
      .map(([id, v]) => ({
        id,
        name: `${id.slice(0, 8)}...`,
        memeCount: v.count,
        totalLikes: v.likes,
        seed: id,
      }))
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 6);
  };

  const creators =
    allMemes && allMemes.length > 0
      ? buildCreatorsFromMemes(allMemes)
      : SAMPLE_CREATORS;

  const trendingMemes =
    allMemes && allMemes.length > 0
      ? [...allMemes]
          .sort((a, b) => Number(b.likesCount) - Number(a.likesCount))
          .slice(0, 4)
          .map((m) => ({
            id: m.id.toString(),
            imageUrl: m.imageUrl.getDirectURL(),
            caption: m.caption,
            likes: Number(m.likesCount),
          }))
      : SAMPLE_TRENDING;

  const filteredCreators = creators.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="glass sticky top-0 z-30 border-b border-border">
        <div className="flex items-center px-4 h-14 max-w-lg mx-auto">
          <h1 className="font-display text-xl font-bold text-gradient">
            Community
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-24 pt-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="community.search_input"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border-border pl-9"
          />
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h2 className="font-display text-base font-bold">Top Creators</h2>
          </div>
          {filteredCreators.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="community.empty_state"
            >
              No creators found.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredCreators.map((creator, i) => (
                <motion.div
                  key={creator.id}
                  data-ocid={`community.item.${i + 1}`}
                  className="bg-card rounded-2xl border border-border p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-primary transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Avatar className="w-14 h-14">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${creator.seed}`}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm text-center truncate w-full">
                    {creator.name}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{creator.memeCount} memes</span>
                    <span>·</span>
                    <span>{formatNumber(creator.totalLikes)} ❤️</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Creator
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-accent" />
            <h2 className="font-display text-base font-bold">
              Trending Now 🔥
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {trendingMemes.map((m, i) => (
              <motion.div
                key={m.id}
                data-ocid={`community.item.${i + 7}`}
                className="bg-card rounded-2xl overflow-hidden border border-border"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <img
                  src={m.imageUrl}
                  alt={m.caption}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{m.caption}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    ❤️ {formatNumber(m.likes)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
