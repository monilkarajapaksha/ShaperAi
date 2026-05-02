import { motion } from "framer-motion";
import { Feather, Target, Waves } from "lucide-react";

const features = [
  {
    icon: Feather, // Keeping icons for now, but text changes
    title: "AI-Simulated Drag Reduction",
    description:
      "Thousands of CFD simulations run to achieve the perfect hydrodynamic profile. Friction is optional.",
  },
  {
    icon: Target,
    title: "Generative Fin Placement",
    description:
      "Fin boxes positioned by evolutionary algorithms for optimal turn radius and hold.",
  },
  {
    icon: Waves,
    title: "Machine Learning Rocker",
    description:
      "Rocker curves trained on oceanographic wave data for specific break types.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const Features = () => {
  return (
    <section id="features" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter text-heading mb-4">
            Designed by Intelligence
          </h2>
          <p className="text-body text-lg max-w-xl mx-auto">
            Every AEROFORM board is born from millions of data points, not just intuition.
          </p>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="group relative"
            >
              <motion.div
                className="relative p-8 lg:p-10 rounded-2xl bg-card border border-border transition-all duration-500 h-full"
                whileHover={{
                  borderColor: "hsl(200 80% 50% / 0.3)",
                  boxShadow: "0 0 40px hsl(200 80% 50% / 0.15)",
                }}
              >
                {/* Icon */}
                <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-secondary">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl lg:text-2xl font-semibold tracking-tight text-heading mb-3">
                  {feature.title}
                </h3>
                <p className="text-body leading-relaxed">
                  {feature.description}
                </p>

                {/* Subtle corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-primary/30 rounded-tr-xl" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
