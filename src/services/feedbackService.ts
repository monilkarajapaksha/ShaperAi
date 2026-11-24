import httpClient from "@/lib/httpClient";
import { BoardFeedback } from "@/types/userDetails";

export interface FeedbackPayload extends Omit<BoardFeedback, "submittedAt"> {
  boardId?: string;
  boardType?: string;
  /** Anonymous answers that explain the result; no names or contact details. */
  context?: Record<string, unknown>;
}

export const feedbackService = {
  submit: (payload: FeedbackPayload) =>
    httpClient.post<{ ok: boolean }>("/api/feedback", { data: payload, timeout: 10_000, retries: 1, auth: false }),
};

export default feedbackService;
