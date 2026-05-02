import { useRef, useEffect, useState, useCallback } from "react";
import { useScroll, useTransform, useAnimationFrame } from "framer-motion";
import TextOverlay from "./TextOverlay";
import Loading from "./Loading";

const TOTAL_FRAMES = 40;

// Generate frame URLs based on the naming convention
const getFrameUrl = (index: number): string => {
  const frameNumber = String(index + 1).padStart(3, "0");
  return `/frams/ezgif-frame-${frameNumber}.jpg`;
};

const SurfboardScroll = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });



  // Optimize image loading with async decoding
  useEffect(() => {
    const loadImages = async () => {
      const loadedImages: HTMLImageElement[] = [];
      let loaded = 0;

      const loadImage = (index: number): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = getFrameUrl(index);
          img.onload = () => {
             // Try to decode if supported for smoother first paint
            if ('decode' in img) {
              img.decode().then(() => {
                loaded++;
                setLoadProgress((loaded / TOTAL_FRAMES) * 100);
                resolve(img);
              }).catch(() => {
                loaded++;
                setLoadProgress((loaded / TOTAL_FRAMES) * 100);
                resolve(img);
              });
            } else {
              loaded++;
              setLoadProgress((loaded / TOTAL_FRAMES) * 100);
              resolve(img);
            }
          };
          img.onerror = () => {
            loaded++;
            setLoadProgress((loaded / TOTAL_FRAMES) * 100);
            resolve(img);
          };
        });
      };

      // Load images in batches
      const batchSize = 10;
      for (let i = 0; i < TOTAL_FRAMES; i += batchSize) {
        const batch = [];
        for (let j = i; j < Math.min(i + batchSize, TOTAL_FRAMES); j++) {
          batch.push(loadImage(j));
        }
        const results = await Promise.all(batch);
        loadedImages.push(...results);
      }

      setImages(loadedImages);
      setIsLoading(false);
    };

    loadImages();
  }, []);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvasRef.current.width = width * dpr;
        canvasRef.current.height = height * dpr;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;

        setCanvasSize({ width: width * dpr, height: height * dpr });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const lastFrameRef = useRef(-1);

  // Draw frame to canvas
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = images[index];

      if (!canvas || !ctx || !img || !img.complete || img.naturalWidth === 0) {
        return;
      }

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Calculate "contain" dimensions
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, drawX, drawY;

      if (imgAspect > canvasAspect) {
        // Image is wider - fit to width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgAspect;
        drawX = 0;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        // Image is taller - fit to height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imgAspect;
        drawX = (canvasWidth - drawWidth) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    },
    [images]
  );

  // Decoupled Render Loop
  // Instead of reacting to scroll events, we poll the motion value every animation frame.
  // This ensures we never do more work than the screen refresh rate allows.
  useAnimationFrame(() => {
    if (!images.length || isLoading) return;

    // Read current scroll progress directly from MotionValue
    const progress = scrollYProgress.get(); 
    
    // Calculate target frame
    const targetIndex = Math.min(
      Math.floor(progress * (TOTAL_FRAMES - 1)), 
      TOTAL_FRAMES - 1
    );

    // Only draw if frame has changed
    if (targetIndex !== lastFrameRef.current) {
      drawFrame(targetIndex);
      lastFrameRef.current = targetIndex;
    }
  });

  // Draw initial frame when images load
  useEffect(() => {
    if (images.length > 0 && !isLoading) {
      drawFrame(0);
      lastFrameRef.current = 0;
    }
  }, [images, isLoading, drawFrame, canvasSize]);

  return (
    <>
      {isLoading && <Loading progress={loadProgress} />}

      <section
        ref={containerRef}
        id="technology"
        className="relative h-[400vh] bg-background"
      >
        {/* Sticky canvas container */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
          />

          {/* Text overlays */}
          {!isLoading && <TextOverlay scrollProgress={scrollYProgress} />}
        </div>
      </section>
    </>
  );
};

export default SurfboardScroll;
