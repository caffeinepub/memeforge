import { Toaster } from "@/components/ui/sonner";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { BottomNav } from "./components/BottomNav";
import { SplashScreen } from "./components/SplashScreen";
import { AIGeneratorPage } from "./pages/AIGeneratorPage";
import { CommunityPage } from "./pages/CommunityPage";
import { CreatePage } from "./pages/CreatePage";
import { HomePage } from "./pages/HomePage";
import { ProfilePage } from "./pages/ProfilePage";

export type Page = "home" | "ai" | "create" | "community" | "profile";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activePage, setActivePage] = useState<Page>("home");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
      </AnimatePresence>

      {!showSplash && (
        <>
          <AnimatePresence mode="wait">
            {activePage === "home" && <HomePage key="home" />}
            {activePage === "ai" && <AIGeneratorPage key="ai" />}
            {activePage === "create" && <CreatePage key="create" />}
            {activePage === "community" && <CommunityPage key="community" />}
            {activePage === "profile" && <ProfilePage key="profile" />}
          </AnimatePresence>
          <BottomNav activePage={activePage} setPage={setActivePage} />
        </>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.15 0.025 285)",
            border: "1px solid oklch(0.22 0.03 285)",
            color: "oklch(0.97 0.005 285)",
          },
        }}
      />

      {/* Footer */}
      <div className="hidden">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
