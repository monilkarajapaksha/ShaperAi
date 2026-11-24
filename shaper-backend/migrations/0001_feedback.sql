-- Beta feedback collected after the AI board appears.
CREATE TABLE IF NOT EXISTS feedback (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  board_id      TEXT,
  board_type    TEXT,
  looks_real    INTEGER,          -- 1 yes, 0 no, NULL not answered
  would_ride    INTEGER,          -- 1 yes, 0 no, NULL not answered
  problem_areas TEXT,             -- JSON array: nose, tail, rails, fins, bottom
  report        TEXT,
  context       TEXT              -- JSON: anonymous answers (skill, goal, wave size, ...)
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_board_type ON feedback (board_type);
