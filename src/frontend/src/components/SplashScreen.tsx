import { motion } from "motion/react";

export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.06 0.02 285), oklch(0.1 0.03 294))",
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ scale: 0.6, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <motion.img
          src="/assets/generated/memeforge-logo-transparent.dim_400x400.png"
          alt="MemeForge"
          className="w-32 h-32 object-contain"
          animate={{ rotate: [0, -5, 5, -3, 0] }}
          transition={{ duration: 1, delay: 0.3, ease: "easeInOut" }}
        />
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <h1 className="font-display text-5xl font-extrabold text-gradient tracking-tight">
            MemeForge
          </h1>
          <p className="text-muted-foreground mt-2 text-sm tracking-widest uppercase">
            Forge Your Memes
          </p>
        </motion.div>
        <motion.div
          className="flex gap-1.5 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full gradient-primary"
              animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1,
                delay: i * 0.2,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
