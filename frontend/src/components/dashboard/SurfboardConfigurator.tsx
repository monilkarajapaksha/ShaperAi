import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import BoardBuilder, { BoardBuilderHandle } from "@/components/builder/BoardBuilder";
import { boardStorage, toStoredDesign } from "@/lib/boardStorage";
import boardReconfigurationService from "@/services/boardReconfigurationService";
import { SavedSurfboard } from "@/types/userDetails";
import { BoardDesign, BoardDesignInput, BoardParams } from "@/types/boardDesign";

interface SurfboardConfiguratorProps {
  boardId?: string;
  isEditMode?: boolean;
  onBack?: () => void;
}

// AEROFORM dark / ocean palette (matches the app theme and the builder tokens in index.css).
const ACCENT = "hsl(200 80% 50%)";

const PARAM_LABELS: Record<keyof BoardParams, string> = {
  length: "Length", width: "Width", thickness: "Thickness", noseWidth: "Nose width", tailWidth: "Tail width",
  widePoint: "Wide point", noseTip: "Nose tip", tailShape: "Tail shape", tailDepth: "Tail depth",
  noseRocker: "Nose rocker", tailRocker: "Tail rocker", noseThickness: "Nose thickness", tailThickness: "Tail thickness",
  railProfile: "Rail profile", railEdge: "Rail edge", deckDome: "Deck dome", singleConcave: "Single concave",
  doubleConcave: "Double concave", vee: "Vee", channels: "Channels", fins: "Fins", finDepth: "Fin depth",
  finCant: "Fin cant", finToe: "Fin toe", stringer: "Stringer", leashPlug: "Leash plug", finish: "Finish",
};

/** Comparable snapshot of what the user can edit in the builder. */
const designKey = (d: Pick<BoardDesign, "type" | "params" | "colors" | "units">) =>
  JSON.stringify({ type: d.type, params: d.params, colors: d.colors, units: d.units });

const toInput = (d: BoardDesign): BoardDesignInput => ({ type: d.type, units: d.units, params: d.params, colors: d.colors });

function changedParams(before: BoardDesign, after: BoardDesign): string[] {
  const out = (Object.keys(PARAM_LABELS) as (keyof BoardParams)[])
    .filter((k) => JSON.stringify(before.params[k]) !== JSON.stringify(after.params[k]))
    .map((k) => PARAM_LABELS[k]);
  if (before.type !== after.type) out.unshift(`Type → ${after.typeName}`);
  if (JSON.stringify(before.colors) !== JSON.stringify(after.colors)) out.push("Colors");
  return out;
}

export default function SurfboardConfigurator({ boardId, isEditMode = false, onBack }: SurfboardConfiguratorProps) {
  const navigate = useNavigate();
  const builderRef = useRef<BoardBuilderHandle>(null);

  const board = useMemo<SavedSurfboard | null>(() => (boardId ? boardStorage.getById(boardId) : null), [boardId]);
  const initialDesign = useMemo<BoardDesignInput>(
    () => (board ? toInput(board.design as BoardDesign) : { type: "shortboard" }),
    [board]
  );

  const [ready, setReady] = useState(false);
  const [design, setDesign] = useState<BoardDesign | null>(null);
  const [baseline, setBaseline] = useState<string | null>(null);
  const [boardName, setBoardName] = useState(board?.name ?? "");
  const [savedName, setSavedName] = useState(board?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const [refinementInput, setRefinementInput] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [reasoning, setReasoning] = useState(board?.suggestion?.reasoning ?? "");
  const [showReasoning, setShowReasoning] = useState(!!board?.suggestion?.reasoning);
  const targetVolume = board?.suggestion?.targetVolumeLiters;

  const isDirty = ready && !!design && (designKey(design) !== baseline || boardName.trim() !== savedName);

  useEffect(() => {
    if (isEditMode && boardId && !board) {
      toast.error("Board not found");
      navigate("/dashboard");
    }
  }, [isEditMode, boardId, board, navigate]);

  useEffect(() => {
    if (!isDirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const handleReady = (full: BoardDesign) => {
    setDesign(full);
    setBaseline(designKey(full));
    setReady(true);
    if (board) {
      // AI-generated and migrated boards are stored as partial designs; store the builder's complete version (with volume).
      if (!board.design.computed || designKey(board.design) !== designKey(full)) {
        boardStorage.update(board.id, { design: full });
      }
    } else {
      const name = boardStorage.generateName({ design: full });
      setBoardName(name);
    }
  };

  // Builder save flow → local board storage.
  const persist = (full: BoardDesign) => {
    const name = boardName.trim() || boardStorage.generateName({ design: full });
    if (board) {
      const updated = boardStorage.update(board.id, { design: full }, name);
      if (!updated) throw new Error("board no longer exists");
      return { id: updated.id };
    }
    const created = boardStorage.save({ design: full }, name);
    return { id: created.id, created: true };
  };

  const handleSave = async () => {
    if (!builderRef.current) return;
    setIsSaving(true);
    const res = await builderRef.current.save();
    setIsSaving(false);
    if (!res.ok || !res.design) {
      toast.error(`Failed to save board${res.error ? `: ${res.error}` : ""}`);
      return;
    }
    const result = res.result as { id: string; created?: boolean };
    const name = boardName.trim() || boardStorage.generateName({ design: res.design });
    setBoardName(name);
    setSavedName(name);
    setBaseline(designKey(res.design));
    toast.success(`"${name}" saved to your collection`);
    if (result.created) navigate(`/configurator/${result.id}`, { replace: true });
  };

  const handleBack = () => {
    if (isDirty && !window.confirm("You have unsaved changes. Leave without saving?")) return;
    (onBack ?? (() => navigate("/dashboard")))();
  };

  const handleRefineBoard = async () => {
    const preference = refinementInput.trim();
    if (!preference || !builderRef.current) return;

    setIsRefining(true);
    try {
      const before = await builderRef.current.getDesign();
      const res = await boardReconfigurationService.reconfigure({ design: toInput(before), preference });
      const after = await builderRef.current.setDesign(toStoredDesign({ ...res.design, units: before.units }));
      setDesign(after);
      setReasoning(res.reasoning);
      setShowReasoning(true);
      setRefinementInput("");

      const changes = changedParams(before, after);
      if (changes.length) {
        toast.success("Board refined", {
          description: `Changed: ${changes.join(", ")}`,
          action: { label: "Undo", onClick: () => builderRef.current?.setDesign(toInput(before)).then(setDesign) },
        });
      } else {
        toast.info("The AI kept the current shape", { description: res.reasoning });
      }
    } catch (error) {
      console.error("Error refining board:", error);
      toast.error("Failed to refine board via AI. Make sure the backend is connected.");
    } finally {
      setIsRefining(false);
    }
  };

  if (isEditMode && boardId && !board) return null;

  return (
    <div
      className="min-h-screen md:h-screen flex flex-col md:overflow-hidden"
      style={{ background: "hsl(0 0% 2%)", color: "hsl(0 0% 96%)", fontFamily: '"Inter", system-ui, sans-serif' }}
    >
      {/* App bar */}
      <header className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10 bg-[hsl(0_0%_4%)]">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-white/15 text-white/80 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>
        <div className="flex flex-col min-w-[200px] flex-1 max-w-md">
          <label htmlFor="board-name" className="text-[11px] uppercase tracking-[0.08em] text-white/50">
            {isEditMode ? "Edit design" : "New design"}
          </label>
          <input
            id="board-name"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            placeholder="Board name"
            className="bg-transparent text-lg font-semibold tracking-tight outline-none border-b border-transparent focus:border-primary placeholder:text-white/30"
          />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-white/50 tabular-nums" role="status" aria-live="polite">
            {!ready ? "Loading builder…" : isDirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!ready || isSaving || (!isDirty && !!board)}
            className="px-4 py-2 text-sm font-semibold rounded-lg text-[hsl(0_0%_2%)] shadow-[0_0_24px_hsl(200_80%_50%/0.25)] disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed hover:brightness-110 transition"
            style={{ background: ACCENT }}
          >
            {isSaving ? "Saving…" : "Save design"}
          </button>
        </div>
      </header>

      {/* AI refinement */}
      <section className="px-4 py-3 border-b border-white/10 bg-[hsl(210_12%_7%)]">
        <form
          className="flex flex-wrap items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleRefineBoard();
          }}
        >
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] text-white/90">
            <Sparkles className="w-4 h-4" style={{ color: ACCENT }} />
            AI shaper
          </span>
          <input
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            disabled={!ready || isRefining}
            placeholder={`e.g. "More paddle power for small waves" or "Make it looser in steep surf"`}
            className="flex-1 min-w-[220px] h-9 px-3 text-sm rounded-lg bg-[hsl(0_0%_2%)] text-white border border-white/15 outline-none placeholder:text-white/30 focus:border-primary focus:ring-1 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={!ready || isRefining || !refinementInput.trim()}
            className="inline-flex items-center gap-2 h-9 px-4 text-sm font-medium rounded-lg border border-white/15 text-white/90 hover:bg-white/[0.07] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isRefining && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRefining ? "Refining…" : "Refine shape"}
          </button>
          {(reasoning || targetVolume) && (
            <button
              type="button"
              onClick={() => setShowReasoning((v) => !v)}
              className="inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color: ACCENT }}
            >
              Why this shape
              {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </form>
        {showReasoning && (reasoning || targetVolume) && (
          <div className="mt-2 text-[13px] leading-relaxed text-white/70 max-w-5xl">
            {targetVolume && design && (
              <p className="mb-1 tabular-nums">
                AI target volume <b>{targetVolume.toFixed(1)} L</b> · current <b>{design.computed.volumeLiters.toFixed(1)} L</b>
              </p>
            )}
            {reasoning && <p className="m-0">{reasoning}</p>}
          </div>
        )}
      </section>

      {/* Board builder: presets, parameter controls, 3D view, blueprints, units, reset, OBJ/GLB export */}
      <BoardBuilder
        ref={builderRef}
        className="flex-1 md:min-h-[640px] relative"
        hide="save"
        initialDesign={initialDesign}
        onReady={handleReady}
        onChange={setDesign}
        onSave={persist}
      />
    </div>
  );
}
