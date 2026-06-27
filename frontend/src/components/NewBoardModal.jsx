import { useState } from "react";
import { colors } from "../tokens";
import { Spinner } from "./AuthShell";

export default function NewBoardModal({ onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setCreating(true);
    await onCreate(trimmed);
    setCreating(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(22,24,40,.4)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 15,
          padding: 24,
          boxShadow: "0 24px 60px rgba(0,0,0,.28)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 4 }}>
          Create board
        </div>
        <div style={{ fontSize: 13.5, color: colors.textMuted, marginBottom: 18 }}>
          Give your board a clear, short name.
        </div>
        <form onSubmit={handleSubmit}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Q3 Roadmap"
            autoFocus
            style={{
              width: "100%",
              height: 44,
              padding: "0 13px",
              border: `1px solid ${colors.borderInput}`,
              borderRadius: 10,
              fontSize: 14.5,
              outline: "none",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: 40,
                padding: "0 16px",
                border: `1px solid #e0e2e8`,
                background: "#fff",
                borderRadius: 9,
                fontSize: 14,
                color: colors.textLabel,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              style={{
                height: 40,
                padding: "0 18px",
                border: "none",
                background: colors.accent,
                color: "#fff",
                borderRadius: 9,
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {creating && <Spinner size={14} />}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
