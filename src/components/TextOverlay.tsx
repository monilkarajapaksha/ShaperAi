import { motion, useTransform, MotionValue } from "framer-motion";

interface TextOverlayProps {
  scrollProgress: MotionValue<number>;
}

interface TextSection {
  start: number;
  end: number;
  align: "left" | "center" | "right";
  headline: string;
  subtext?: string;
}

const sections: TextSection[] = [
  {
    start: 0,
    end: 0.2,
    align: "center",
    headline: "SHAPER AI.",
    subtext: "Engineered for Flow.",
  },
  {
    start: 0.25,
    end: 0.35,
    align: "left",
    headline: "Neural Hydrodynamics.",
    subtext: "Flow patterns optimized by deep learning algorithms.",
  },
  {
    start: 0.5,
    end: 0.65,
    align: "right",
    headline: "Generative Lattice Rail.",
    subtext: "Structure evolved for max strength-to-weight ratio.",
  },
  {
    start: 0.7,
    end: 0.85,
    align: "left",
    headline: "Data-Core.",
    subtext: "Density mapped to wave energy patterns.",
  },
];

const TextOverlay = ({ scrollProgress }: TextOverlayProps) => {
  const getAlignmentClasses = (align: "left" | "center" | "right") => {
    switch (align) {
      case "left":
        return "items-start text-left left-8 lg:left-16 xl:left-24";
      case "right":
        return "items-end text-right right-8 lg:right-16 xl:right-24";
      case "center":
        return "items-center text-center left-1/2 -translate-x-1/2";
    }
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("features");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  // CTA Opacity Logic
  const ctaOpacity = useTransform(scrollProgress, [0.88, 0.92, 1], [0, 1, 1]);
  const ctaPointerEvents = useTransform(scrollProgress, (v) => (v > 0.88 ? 'auto' : 'none'));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sections.map((section, index) => {
        // Create transform for each section
        // We map [start, start + 0.05, end - 0.05, end] to [0, 1, 1, 0]
        const opacity = useTransform(
            scrollProgress,
            [section.start, section.start + 0.05, section.end - 0.05, section.end],
            [0, 1, 1, 0]
        );
        
        const alignClasses = getAlignmentClasses(section.align);

        return (
          <motion.div
            key={index}
            className={`absolute top-1/2 -translate-y-1/2 flex flex-col ${alignClasses} max-w-lg px-4`}
            style={{ opacity }}
            initial={false}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tighter text-heading leading-tight">
              {section.headline}
            </h2>
            {section.subtext && (
              <p className="mt-4 text-base sm:text-lg text-body max-w-md">
                {section.subtext}
              </p>
            )}
          </motion.div>
        );
      })}

      {/* Final CTA */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
        style={{ opacity: ctaOpacity, pointerEvents: ctaPointerEvents }}
      >
        <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tighter text-heading mb-4">
          Built to Break Limits.
        </h2>
        <p className="text-lg sm:text-xl text-body mb-8 max-w-md">
          Experience the next generation of surf engineering.
        </p>
        <motion.button
          onClick={scrollToFeatures}
          className="px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full text-sm tracking-wide hover:bg-primary/90 transition-all duration-300 animate-pulse-glow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explore Models
        </motion.button>
      </motion.div>
    </div>
  );
};

export default TextOverlay;
