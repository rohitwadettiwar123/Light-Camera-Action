import { useState, Suspense, lazy, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SplashScreen } from "@/components/birthday/SplashScreen";
import { CinematicIntro } from "@/components/birthday/CinematicIntro";
import { MainBirthday } from "@/components/birthday/MainBirthday";
import { PasswordUnlock } from "@/components/birthday/PasswordUnlock";
import { useBirthdayStore } from "@/features/core/store/useBirthdayStore";
import { useDynamicTheme } from "@/features/core/theme/useDynamicTheme";
import { useDynamicSEO } from "@/features/core/seo/useDynamicSEO";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingElements } from "@/components/birthday/FloatingElements";
import { SparkleRain } from "@/components/birthday/SparkleRain";
import { FireflyEffect } from "@/components/birthday/FireflyEffect";
import { ShootingStars } from "@/components/birthday/ShootingStars";
import { EmojiCursorTrail } from "@/components/birthday/EmojiCursorTrail";
import { PremiumFireworks } from "@/components/birthday/PremiumFireworks";
import { isPasswordRequired } from "@/utils/password";
import { useTranslation } from "@/i18n";
import { hexToHSL } from "@/utils/colorUtils";
import type { GpuTier } from "@/hooks/useAdaptiveQuality";

// Lazy-load the aurora (three-aurora chunk — not needed for initial paint)
const AuroraBackground = lazy(() =>
  import("@/components/birthday/AuroraBackground").then((m) => ({
    default: m.AuroraBackground,
  })),
);

type Phase = "splash" | "unlock" | "intro" | "main";

// Quality tier → aurora phase mapping
const PHASE_AURORA: Record<Phase, number> = {
  splash: 0,
  unlock: 0.2,
  intro: 0.5,
  main: 1.0,
};

const PERSONA_AURORA_INT: Record<string, number> = {
  friend: 0,
  partner: 1,
};

// Persistent quality tier stored in localStorage
function readStoredTier(): GpuTier | null {
  try {
    const v = localStorage.getItem("bb_quality");
    if (v === "low" || v === "medium" || v === "high") return v;
  } catch {
    /* ignore */
  }
  return null;
}

const Index = () => {
  const [phase, setPhase] = useState<Phase>(() => {
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("phase");
      if (param === "main" || param === "intro" || param === "unlock") {
        return param;
      }
    }
    return "splash";
  });
  const [fireworksRunKey, setFireworksRunKey] = useState(0);
  const [qualityTier, setQualityTier] = useState<GpuTier>(
    () => readStoredTier() ?? "medium",
  );
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  const isMobile = useIsMobile();
  const config = useBirthdayStore((state) => state.config);
  const { t } = useTranslation();
  useDynamicTheme();
  useDynamicSEO(config);

  // Check WebGL availability once on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      setWebGLAvailable(!!ctx);
    } catch {
      setWebGLAvailable(false);
    }
  }, []);

  const cycleQuality = () => {
    setQualityTier((prev) => {
      const next: GpuTier =
        prev === "high" ? "medium" : prev === "medium" ? "low" : "high";
      try {
        localStorage.setItem("bb_quality", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const showQualityToggle =
    config.showSkipButton !== false &&
    import.meta.env.VITE_QUALITY_TOGGLE !== "false";

  // Derive aurora accent from theme color
  const { h: accentH, s: accentS, l: accentL } = hexToHSL(
    config.favoriteColor || "#FF6B9D",
  );

  const auroraPersona = PERSONA_AURORA_INT[config.relationship ?? "friend"] ?? 0;
  const auroraEnabled =
    webGLAvailable &&
    qualityTier !== "low" &&
    import.meta.env.VITE_AURORA_ENABLE !== "false";

  const qualityLabel: Record<GpuTier, string> = {
    high: "✨ High",
    medium: "⚡ Mid",
    low: "🔋 Low",
  };

  return (
    <main
      aria-label="Birthday Celebration Experience"
      className="min-h-screen transition-colors duration-1000 relative overflow-hidden"
      style={{
        background: auroraEnabled
          ? "transparent"
          : "var(--bg-gradient, #1a0515)",
      }}
    >
      {/* ── Aurora WebGL Background (lazy, chunk: three-aurora) ── */}
      {auroraEnabled && (
        <Suspense fallback={null}>
          <AuroraBackground
            accentH={accentH}
            accentS={accentS}
            accentL={accentL}
            phase={PHASE_AURORA[phase]}
            intensity={0.75}
            persona={auroraPersona}
          />
        </Suspense>
      )}

      {/* CSS fallback gradient when WebGL unavailable or quality=low */}
      {!auroraEnabled && (
        <>
          <div className="fixed top-[5%] left-[8%] w-[38rem] h-[38rem] rounded-full bg-[radial-gradient(circle,rgba(255,75,130,0.16)_0%,rgba(255,75,130,0.08)_40%,transparent_70%)] pointer-events-none animate-subtle-float" />
          <div className="fixed top-[20%] right-[8%] w-[34rem] h-[34rem] rounded-full bg-[radial-gradient(circle,rgba(255,200,100,0.14)_0%,rgba(255,200,100,0.05)_40%,transparent_70%)] pointer-events-none animate-pulse" />
          <div className="fixed bottom-[10%] left-[25%] w-[42rem] h-[42rem] rounded-full bg-[radial-gradient(circle,rgba(180,60,140,0.15)_0%,rgba(180,60,140,0.06)_40%,transparent_70%)] pointer-events-none" />
        </>
      )}

      {/* Lightweight ambient effects */}
      <EmojiCursorTrail />
      <PremiumFireworks runKey={fireworksRunKey} />
      <FloatingElements />

      {/* Additional effects only in main phase */}
      {phase === "main" && (
        <>
          <SparkleRain intensity={isMobile ? 4 : 6} />
          <FireflyEffect intensity={isMobile ? 3 : 5} />
          <ShootingStars count={isMobile ? 2 : 3} />
        </>
      )}

      {/* Vignette overlay */}
      <div className="vignette" />

      {/* Skip Intro button */}
      {phase !== "main" &&
        phase !== "unlock" &&
        config.showSkipButton !== false && (
          <button
            onClick={() => {
              setPhase("main");
              setFireworksRunKey((key) => key + 1);
            }}
            aria-label={t("common.skipIntro")}
            className="fixed bottom-6 right-6 z-50 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl rounded-full text-white/40 hover:text-white/90 text-xs tracking-[0.2em] uppercase transition-all duration-300 shadow-2xl"
          >
            {t("common.skipIntro")}
          </button>
        )}

      {/* Quality toggle button (main phase only) */}
      {phase === "main" && showQualityToggle && (
        <button
          onClick={cycleQuality}
          aria-label={`Visual quality: ${qualityLabel[qualityTier]}. Click to cycle.`}
          title="Toggle visual quality"
          className="fixed bottom-6 left-6 z-50 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-xl rounded-full text-white/40 hover:text-white/80 text-xs tracking-wider transition-all duration-300 shadow-xl"
        >
          {qualityLabel[qualityTier]}
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.06 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <SplashScreen
              onStart={() => {
                if (isPasswordRequired(config)) {
                  setPhase("unlock");
                } else {
                  setPhase("intro");
                }
              }}
            />
          </motion.div>
        )}

        {phase === "unlock" && (
          <motion.div
            key="unlock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <PasswordUnlock onUnlock={() => setPhase("intro")} />
          </motion.div>
        )}

        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            <CinematicIntro
              onComplete={() => {
                setPhase("main");
                setFireworksRunKey((key) => key + 1);
              }}
            />
          </motion.div>
        )}

        {phase === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
          >
            <MainBirthday />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;
