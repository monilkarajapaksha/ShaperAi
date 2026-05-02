import { motion } from "framer-motion";

interface LoadingProps {
  progress: number;
}

const Loading = ({ progress }: LoadingProps) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
    >
      {/* Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 border-2 border-muted rounded-full" />
        <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin" />
      </div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-body text-sm font-medium tracking-wide mb-4"
      >
        Preparing frames…
      </motion.p>

      {/* Progress bar */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Percentage */}
      <motion.p
        className="text-muted-foreground text-xs mt-3 tabular-nums"
        key={Math.floor(progress)}
      >
        {Math.floor(progress)}%
      </motion.p>
    </motion.div>
  );
};

export default Loading;
