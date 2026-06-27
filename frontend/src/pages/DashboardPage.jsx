import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../api";
import { colors, boardAccent } from "../tokens";
import NewBoardModal from "../components/NewBoardModal";
import TopBar from "../components/TopBar";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewBoard, setShowNewBoard] = useState(false);

  useEffect(() => {
    loadBoards();
  }, []);

  async function loadBoards() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getBoards();
      setBoards(data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load boards."));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBoard(title) {
    try {
      const board = await api.createBoard(title);
      setBoards((prev) => [...prev, board]);
      setShowNewBoard(false);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not create board."));
    }
  }

  async function handleDeleteBoard(e, id) {
    e.stopPropagation();
    setBoards((prev) => prev.filter((b) => b.id !== id));
    try {
      await api.deleteBoard(id);
    } catch (err) {
      /* board already removed from UI; ignore */
    }
  }

  return (
    <div>
      <TopBar user={user} />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "38px 22px 60px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.02em" }}>Your boards</div>
            <div style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 3 }}>
              {boards.length === 1 ? "1 board" : `${boards.length} boards`}
            </div>
          </div>
          <button
            onClick={() => setShowNewBoard(true)}
            style={{
              height: 40,
              padding: "0 16px",
              border: "none",
              borderRadius: 9,
              background: colors.accent,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 3px 10px rgba(91,91,214,.28)",
            }}
          >
            <span style={{ fontSize: 17, lineHeight: 1, marginTop: -1 }}>+</span>
            <span>New Board</span>
          </button>
        </div>

        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ height: 108, borderRadius: 13, background: "#eef0f3" }} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              background: colors.dangerBg,
              color: colors.dangerStrong,
              fontSize: 13.5,
              padding: "13px 16px",
              borderRadius: 10,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 16 }}>
            {boards.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/board/${b.id}`)}
                style={{
                  position: "relative",
                  height: 108,
                  borderRadius: 13,
                  background: "#fff",
                  border: `1px solid ${colors.borderLight}`,
                  padding: "16px 17px",
                  cursor: "pointer",
                  overflow: "hidden",
                  transition: "box-shadow .16s ease, transform .16s ease",
                  boxShadow: "0 1px 2px rgba(20,22,40,.05)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 22px rgba(20,22,40,.12)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 2px rgba(20,22,40,.05)";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: boardAccent(b.id),
                  }}
                />
                <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.3 }}>
                  {b.title}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: 17,
                    fontSize: 11.5,
                    color: colors.textFaint,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  Open board →
                </div>
                <button
                  onClick={(e) => handleDeleteBoard(e, b.id)}
                  title="Delete board"
                  style={{
                    position: "absolute",
                    top: 11,
                    right: 11,
                    width: 24,
                    height: 24,
                    borderRadius: 7,
                    border: "none",
                    background: "#f3f4f6",
                    color: colors.textFaint,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}

            <div
              onClick={() => setShowNewBoard(true)}
              style={{
                height: 108,
                borderRadius: 13,
                border: "1.5px dashed #d3d6dd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                color: "#8b909b",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
              <span>New board</span>
            </div>
          </div>
        )}
      </div>

      {showNewBoard && (
        <NewBoardModal onClose={() => setShowNewBoard(false)} onCreate={handleCreateBoard} />
      )}
    </div>
  );
}
