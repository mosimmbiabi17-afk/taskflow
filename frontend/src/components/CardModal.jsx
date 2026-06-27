import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import { colors, relativeTime } from "../tokens";
import { Spinner } from "./AuthShell";

export default function CardModal({ card, listName, onClose, onPatchCard }) {
  const { user } = useAuth();
  const userName = user?.username || (user?.email ? user.email.split("@")[0] : "You");
  const userInitial = (userName[0] || "U").toUpperCase();

  const [titleDraft, setTitleDraft] = useState(card.title);
  const [descDraft, setDescDraft] = useState(card.description || "");
  const [descBase, setDescBase] = useState(card.description || "");
  const [savingDesc, setSavingDesc] = useState(false);
  const [descSaved, setDescSaved] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    let active = true;
    setCommentsLoading(true);
    api
      .getComments(card.id)
      .then((data) => {
        if (active) setComments(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setCommentsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [card.id]);

  async function saveTitle() {
    const title = titleDraft.trim();
    if (!title || title === card.title) return;
    onPatchCard(card.id, { title });
    api.updateCard(card.id, { title }).catch(() => {});
  }

  async function saveDesc() {
    setSavingDesc(true);
    try {
      await api.updateCard(card.id, { description: descDraft });
      onPatchCard(card.id, { description: descDraft });
      setDescBase(descDraft);
      setDescSaved(true);
      setTimeout(() => setDescSaved(false), 1800);
    } catch (err) {
      /* keep draft so the user doesn't lose their edit */
    } finally {
      setSavingDesc(false);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    const content = commentDraft.trim();
    if (!content) return;
    setCommentDraft("");
    try {
      const cm = await api.addComment(card.id, content);
      setComments((prev) => [...prev, cm]);
    } catch (err) {
      /* silently ignore — comment box already cleared optimistically */
    }
  }

  const descDirty = descDraft !== descBase;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,24,40,.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        zIndex: 50,
        padding: "5vh 20px",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 600,
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(0,0,0,.3)",
          overflow: "hidden",
        }}
      >
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 22px 4px" }}>
          <input
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={saveTitle}
            style={{
              flex: 1,
              minWidth: 0,
              border: "1px solid transparent",
              borderRadius: 8,
              padding: "6px 8px",
              margin: "-6px -8px",
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: "-.01em",
              outline: "none",
              background: "none",
            }}
          />
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              flexShrink: 0,
              border: "none",
              borderRadius: 8,
              background: "#f3f4f6",
              color: colors.textMuted,
              fontSize: 15,
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "0 22px 6px", fontSize: 12, color: colors.textFaint, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
          in list · {listName}
        </div>

        {/* Description */}
        <div style={{ padding: "14px 22px 8px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLabel, marginBottom: 9, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>≡</span> Description
          </div>
          <textarea
            value={descDraft}
            onChange={(e) => {
              setDescDraft(e.target.value);
              setDescSaved(false);
            }}
            placeholder="Add a more detailed description…"
            rows={4}
            style={{
              width: "100%",
              border: `1px solid ${colors.borderSubtle}`,
              borderRadius: 10,
              padding: "11px 13px",
              fontSize: 14,
              lineHeight: 1.55,
              outline: "none",
              background: "#fafbfc",
              fontFamily: "inherit",
              resize: "none",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 9, height: 34 }}>
            {descDirty && (
              <>
                <button
                  onClick={saveDesc}
                  style={{
                    height: 32,
                    padding: "0 14px",
                    border: "none",
                    borderRadius: 8,
                    background: colors.accent,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                >
                  {savingDesc && <Spinner size={13} />}
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setDescDraft(descBase)}
                  style={{ height: 32, padding: "0 12px", border: "none", borderRadius: 8, background: "none", color: "#8b909b", fontSize: 13 }}
                >
                  Cancel
                </button>
              </>
            )}
            {descSaved && !descDirty && (
              <span style={{ fontSize: 12.5, color: colors.success, display: "flex", alignItems: "center", gap: 5 }}>
                ✓ Saved
              </span>
            )}
          </div>
        </div>

        {/* Comments */}
        <div style={{ padding: "12px 22px 22px", borderTop: "1px solid #f0f1f4", marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: colors.textLabel, marginBottom: 13, display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14 }}>💬</span> Comments
          </div>

          <form onSubmit={submitComment} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}>
            <Avatar initial={userInitial} bg={colors.accent} color="#fff" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                placeholder="Write a comment…"
                style={{
                  width: "100%",
                  height: 40,
                  padding: "0 13px",
                  border: `1px solid ${colors.borderSubtle}`,
                  borderRadius: 9,
                  fontSize: 14,
                  outline: "none",
                  background: "#fafbfc",
                }}
              />
              {commentDraft.trim().length > 0 && (
                <button
                  type="submit"
                  style={{
                    marginTop: 9,
                    height: 32,
                    padding: "0 14px",
                    border: "none",
                    borderRadius: 8,
                    background: colors.accent,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Comment
                </button>
              )}
            </div>
          </form>

          {commentsLoading && <div style={{ fontSize: 13, color: colors.textFaint, padding: "6px 0" }}>Loading comments…</div>}

          {!commentsLoading && comments.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {comments.map((c) => (
                <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Avatar initial="D" bg="#e7e7f5" color={colors.accent} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>Demo</span>
                      <span style={{ fontSize: 11.5, color: colors.textFaint }}>{relativeTime(c.created_at)}</span>
                    </div>
                    <div style={{ background: "#f4f5f7", borderRadius: 9, padding: "9px 12px", fontSize: 13.5, lineHeight: 1.5, color: "#2b2f38", marginTop: 5 }}>
                      {c.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!commentsLoading && comments.length === 0 && (
            <div style={{ fontSize: 13, color: colors.textFaint, padding: "2px 0" }}>No comments yet. Start the conversation.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Avatar({ initial, bg, color }) {
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: "50%",
        background: bg,
        color,
        fontSize: 12.5,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
