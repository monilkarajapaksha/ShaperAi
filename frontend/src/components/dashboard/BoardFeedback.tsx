import { useState } from "react";
import { Check, MessageSquarePlus, X } from "lucide-react";
import { toast } from "sonner";
import { boardStorage } from "@/lib/boardStorage";
import feedbackService from "@/services/feedbackService";
import { BoardFeedback as Feedback, FeedbackArea, SavedSurfboard } from "@/types/userDetails";

const AREAS: { id: FeedbackArea; label: string }[] = [
  { id: "nose", label: "Nose" },
  { id: "tail", label: "Tail" },
  { id: "rails", label: "Rails" },
  { id: "fins", label: "Fins" },
  { id: "bottom", label: "Bottom" },
];

const YesNo = ({ value, onChange }: { value?: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex gap-2">
    {[true, false].map((v) => (
      <button
        key={String(v)}
        type="button"
        onClick={() => onChange(v)}
        aria-pressed={value === v}
        className={`px-4 h-9 rounded-lg text-sm font-medium border transition-colors ${
          value === v ? "bg-white text-black border-white" : "border-white/15 text-white/80 hover:bg-white/[0.07]"
        }`}
      >
        {v ? "Yes" : "No"}
      </button>
    ))}
  </div>
);

/** Beta feedback: floating button that opens a small panel over the builder. */
export default function BoardFeedback({ board }: { board: SavedSurfboard | null }) {
  const [open, setOpen] = useState(false);
  const [looksReal, setLooksReal] = useState<boolean>();
  const [wouldRide, setWouldRide] = useState<boolean>();
  const [areas, setAreas] = useState<FeedbackArea[]>([]);
  const [report, setReport] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(!!board?.feedback);

  const toggle = (a: FeedbackArea) => setAreas((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  const empty = looksReal === undefined && wouldRide === undefined && !areas.length && !report.trim();

  const submit = async () => {
    const fb: Feedback = {
      looksReal, wouldRide, problemAreas: areas, report: report.trim() || undefined, submittedAt: new Date().toISOString(),
    };
    setSending(true);
    // Always keep it locally; sending to the server is best-effort.
    if (board) boardStorage.update(board.id, { feedback: fb });
    const u = board?.userDetails;
    try {
      await feedbackService.submit({
        ...fb,
        boardId: board?.id,
        boardType: board?.design.type,
        context: u && { skill: u.skill, goal: u.goal, wave_size: u.wave_size, wave_type: u.wave_type, fitness: u.fitness_level, complaint: u.current_board_complaint, shaper_mode: u.shaper_mode },
      });
    } catch (e) {
      console.warn("Feedback not delivered, saved locally", e);
    }
    setSending(false);
    setSent(true);
    setOpen(false);
    toast.success("Thanks, that helps us improve the shaper.");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open ? (
        <div role="dialog" aria-label="Beta feedback" className="w-[min(92vw,340px)] rounded-2xl border border-white/15 bg-[hsl(0_0%_6%)] p-4 shadow-2xl space-y-4 text-sm text-white">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">How did the AI do?</h2>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-1.5"><p className="text-white/70">Does this look like a real surfboard?</p><YesNo value={looksReal} onChange={setLooksReal} /></div>
          <div className="space-y-1.5"><p className="text-white/70">Would you ride this?</p><YesNo value={wouldRide} onChange={setWouldRide} /></div>
          <div className="space-y-1.5">
            <p className="text-white/70">What looks wrong?</p>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((a) => (
                <button key={a.id} type="button" aria-pressed={areas.includes(a.id)} onClick={() => toggle(a.id)}
                  className={`px-3 h-9 rounded-lg border text-sm transition-colors ${areas.includes(a.id) ? "bg-amber-400 text-black border-amber-400" : "border-white/15 text-white/80 hover:bg-white/[0.07]"}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="fb-report" className="text-white/70">Report a problem</label>
            <textarea id="fb-report" value={report} onChange={(e) => setReport(e.target.value)} maxLength={1000} rows={3}
              placeholder="Tell us what went wrong"
              className="w-full rounded-lg bg-black border border-white/15 p-2 outline-none focus:border-primary resize-none placeholder:text-white/30" />
          </div>
          <button type="button" onClick={submit} disabled={empty || sending}
            className="w-full h-10 rounded-lg font-semibold text-black disabled:opacity-45 disabled:cursor-not-allowed" style={{ background: "hsl(200 80% 50%)" }}>
            {sending ? "Sending…" : "Send feedback"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-white/20 bg-[hsl(0_0%_8%)] text-sm text-white/90 shadow-lg hover:bg-white/10">
          {sent ? <Check className="w-4 h-4 text-green-400" /> : <MessageSquarePlus className="w-4 h-4" />}
          {sent ? "Feedback sent" : "Give beta feedback"}
        </button>
      )}
    </div>
  );
}
