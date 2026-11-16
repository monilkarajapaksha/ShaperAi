import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import "@/lib/surfboard-builder/surfboard-builder.js";
import type { SurfboardBuilderElement } from "@/types/surfboard-builder";
import type { BoardDesign, BoardDesignInput } from "@/types/boardDesign";

export interface BoardBuilderHandle {
  getDesign: () => Promise<BoardDesign>;
  setDesign: (design: BoardDesignInput) => Promise<BoardDesign>;
  save: () => ReturnType<SurfboardBuilderElement["save"]>;
}

interface BoardBuilderProps {
  /** Design loaded once the builder is ready (lengths in inches). */
  initialDesign?: BoardDesignInput;
  /** Space-separated builder sections to hide: header controls presets blueprints save units reset. */
  hide?: string;
  className?: string;
  onReady?: (design: BoardDesign) => void;
  onChange?: (design: BoardDesign) => void;
  /** Called by the builder's save flow; throw to report a failed save. */
  onSave?: (design: BoardDesign) => unknown | Promise<unknown>;
}

/** React wrapper around the <surfboard-builder> web component (3D view, presets, controls, blueprints). */
const BoardBuilder = forwardRef<BoardBuilderHandle, BoardBuilderProps>(
  ({ initialDesign, hide, className, onReady, onChange, onSave }, ref) => {
    const elRef = useRef<SurfboardBuilderElement>(null);
    const callbacks = useRef({ onReady, onChange, onSave });
    callbacks.current = { onReady, onChange, onSave };
    const initial = useRef(initialDesign);

    useEffect(() => {
      const el = elRef.current;
      if (!el) return;
      let cancelled = false;

      el.saveHandler = (design) => callbacks.current.onSave?.(design);
      const handleChange = (e: Event) => {
        const { design } = (e as CustomEvent<{ design: BoardDesign }>).detail;
        callbacks.current.onChange?.(design);
      };
      el.addEventListener("board-change", handleChange);

      el.ready.then(async () => {
        if (cancelled) return;
        if (initial.current) await el.setDesign(initial.current);
        if (!cancelled) callbacks.current.onReady?.(await el.getDesign());
      });

      return () => {
        cancelled = true;
        el.removeEventListener("board-change", handleChange);
        el.saveHandler = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      getDesign: () => elRef.current!.getDesign(),
      setDesign: async (design) => (await elRef.current!.setDesign(design)).design,
      save: () => elRef.current!.save(),
    }));

    return (
      <div className={className}>
        <surfboard-builder ref={elRef} hide={hide} />
      </div>
    );
  }
);
BoardBuilder.displayName = "BoardBuilder";

export default BoardBuilder;
