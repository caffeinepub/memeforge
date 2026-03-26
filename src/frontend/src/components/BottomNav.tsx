import { Home, PlusSquare, Sparkles, User, Users } from "lucide-react";
import { motion } from "motion/react";
import type { Page } from "../App";

interface BottomNavProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; icon: React.ReactNode; label: string }[] = [
  { page: "home", icon: <Home className="w-5 h-5" />, label: "Home" },
  { page: "ai", icon: <Sparkles className="w-5 h-5" />, label: "AI" },
  { page: "create", icon: <PlusSquare className="w-6 h-6" />, label: "Create" },
  {
    page: "community",
    icon: <Users className="w-5 h-5" />,
    label: "Community",
  },
  { page: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
];

export function BottomNav({ activePage, setPage }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ page, icon, label }) => {
          const isActive = activePage === page;
          const isCreate = page === "create";
          return (
            <button
              type="button"
              key={page}
              data-ocid={`nav.${page}.link`}
              onClick={() => setPage(page)}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 transition-all duration-200 ${isCreate ? "-mt-3" : ""}`}
              aria-label={label}
            >
              {isCreate ? (
                <motion.div
                  className="gradient-primary rounded-2xl p-3 shadow-glow"
                  whileTap={{ scale: 0.9 }}
                  animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                >
                  <PlusSquare className="w-6 h-6 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  className={`relative flex flex-col items-center gap-0.5 ${isActive ? "" : "opacity-50"}`}
                  whileTap={{ scale: 0.85 }}
                >
                  <div
                    className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}
                  >
                    {icon}
                  </div>
                  <span
                    className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 w-4 h-0.5 gradient-primary rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </motion.div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
