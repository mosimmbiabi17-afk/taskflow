import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../api";
import { colors } from "../tokens";
import CardModal from "../components/CardModal";

export default function BoardPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userInitial = ((user?.username || user?.email || "U")[0] || "U").toUpperCase();

  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // "add card" composer state, keyed by list id
  const [addingListId, setAddingListId] = useState(null);
  const [newCardTitle, setNewCardTitle] = useState("");

  // "add list" composer state
  const [addingList, setAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");

  // drag & drop state
  const [dragCardId, setDragCardId] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);
  const [dragOverCardId, setDragOverCardId] = useState(null);
  const [dragOverAfter, setDragOverAfter] = useState(false);

  // open card modal
  const [openCardId, setOpenCardId] = useState(null);

  useEffect(() => {
    loadBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  async function loadBoard() {
    setLoading(true);
    setError("");
    setBoard(null);
    try {
      const data = await api.getBoard(boardId);
      setBoard(data);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not load this board."));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBoard() {
    const id = board.id;
    navigate("/dashboard");
    try {
      await api.deleteBoard(id);
    } catch (err) {
      /* already navigated away */
    }
  }

  // ---------------- helper to immutably patch board state ----------------
  function updateBoard(mutator) {
    setBoard((prev) => {
      const b = { ...prev, lists: prev.lists.map((l) => ({ ...l, cards: [...l.cards] })) };
      mutator(b);
      return b;
    });
  }

  function patchCard(cardId, patch) {
    updateBoard((b) => {
      b.lists.forEach((l) => {
        l.cards = l.cards.map((c) => (c.id === cardId ? { ...c, ...patch } : c));
      });
    });
  }

  // ---------------- add card ----------------
  function startAddCard(listId) {
    setAddingListId(listId);
    setNewCardTitle("");
  }
  function cancelAddCard() {
    setAddingListId(null);
    setNewCardTitle("");
  }
  async function submitAddCard(e) {
    e.preventDefault();
    const title = newCardTitle.trim();
    const listId = addingListId;
    if (!title || !listId) return;
    const list = board.lists.find((l) => l.id === listId);
    const position = list ? list.cards.length : 0;
    try {
      const card = await api.createCard({ title, list_id: listId, position });
      updateBoard((b) => {
        b.lists = b.lists.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, card] } : l));
      });
      setNewCardTitle("");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add card."));
    }
  }
  function onAddCardKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAddCard(e);
    }
  }

  // ---------------- add list ----------------
  async function submitAddList(e) {
    e.preventDefault();
    const title = newListTitle.trim();
    if (!title) return;
    const position = board.lists.length;
    try {
      const list = await api.createList({ title, board_id: board.id, position });
      updateBoard((b) => {
        b.lists = [...b.lists, { ...list, cards: list.cards || [] }];
      });
      setAddingList(false);
      setNewListTitle("");
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add list."));
    }
  }

  // ---------------- drag & drop ----------------
  function onCardDragStart(e, cardId) {
    setDragCardId(cardId);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", String(cardId));
    } catch (_) {}
  }
  function onCardDragEnd() {
    setDragCardId(null);
    setDragOverListId(null);
    setDragOverCardId(null);
  }
  function onCardDragOver(e, listId, cardId) {
    e.preventDefault();
    e.stopPropagation();
    if (!dragCardId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const after = e.clientY - rect.top > rect.height / 2;
    if (dragOverListId !== listId || dragOverCardId !== cardId || dragOverAfter !== after) {
      setDragOverListId(listId);
      setDragOverCardId(cardId);
      setDragOverAfter(after);
    }
  }
  function onColumnDragOver(e, listId) {
    e.preventDefault();
    if (!dragCardId) return;
    if (dragOverListId !== listId || dragOverCardId !== null) {
      setDragOverListId(listId);
      setDragOverCardId(null);
      setDragOverAfter(false);
    }
  }
  function onCardDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    performDrop();
  }
  function onColumnDrop(e) {
    e.preventDefault();
    performDrop();
  }
  function performDrop() {
    const srcId = dragCardId;
    if (!srcId) return;
    const targetList = dragOverListId;
    const overCard = dragOverCardId;
    const after = dragOverAfter;
    if (targetList == null) {
      onCardDragEnd();
      return;
    }
    const lists = board.lists.map((l) => ({ ...l, cards: [...l.cards] }));
    let moved = null;
    let srcListId = null;
    for (const l of lists) {
      const i = l.cards.findIndex((c) => c.id === srcId);
      if (i >= 0) {
        srcListId = l.id;
        moved = l.cards.splice(i, 1)[0];
        break;
      }
    }
    if (!moved) {
      onCardDragEnd();
      return;
    }
    const tl = lists.find((l) => l.id === targetList);
    if (!tl) {
      onCardDragEnd();
      return;
    }
    let idx;
    if (overCard == null) {
      idx = tl.cards.length;
    } else {
      idx = tl.cards.findIndex((c) => c.id === overCard);
      if (idx < 0) idx = tl.cards.length;
      else if (after) idx += 1;
    }
    moved = { ...moved, list_id: targetList };
    tl.cards.splice(idx, 0, moved);
    lists.forEach((l) => l.cards.forEach((c, i) => (c.position = i)));
    setBoard((prev) => ({ ...prev, lists }));
    setDragCardId(null);
    setDragOverListId(null);
    setDragOverCardId(null);
    // persist positions for all cards in the affected lists
    lists.forEach((l) => {
      if (l.id === targetList || l.id === srcListId) {
        l.cards.forEach((c) => {
          api.updateCard(c.id, { list_id: l.id, position: c.position }).catch(() => {});
        });
      }
    });
  }

  // ---------------- card modal ----------------
  let openCard = null;
  let openCardListName = "";
  if (board && openCardId != null) {
    for (const l of board.lists) {
      const c = l.cards.find((x) => x.id === openCardId);
      if (c) {
        openCard = c;
        openCardListName = l.title;
        break;
      }
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: colors.boardBg }}>
      {/* Top bar */}
      <div
        style={{
          height: 56,
          background: "#ffffffd9",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #e7e7f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "none",
              border: "1px solid #e0e2e8",
              height: 32,
              width: 32,
              borderRadius: 8,
              color: colors.textMuted,
              fontSize: 15,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {board ? board.title : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div
            style={{
              width: 29,
              height: 29,
              borderRadius: "50%",
              background: colors.accent,
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {userInitial}
          </div>
          <button
            onClick={handleDeleteBoard}
            style={{ background: "none", border: "1px solid #e7d6d7", height: 32, padding: "0 12px", borderRadius: 8, fontSize: 13, color: colors.dangerStrong }}
          >
            Delete
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: 26,
              height: 26,
              border: "3px solid #e0e2ec",
              borderTopColor: colors.accent,
              borderRadius: "50%",
              animation: "tf-spin .8s linear infinite",
            }}
          />
        </div>
      )}

      {!loading && error && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: colors.dangerStrong, fontSize: 14 }}>
          {error}
        </div>
      )}

      {!loading && !error && board && (
        <div className="tf-cols" style={{ flex: 1, display: "flex", gap: 14, alignItems: "flex-start", padding: 18, overflowX: "auto", overflowY: "hidden" }}>
          {board.lists.map((list) => {
            const isTarget = dragOverListId === list.id;
            const showEndLine = isTarget && dragOverCardId === null && dragCardId != null;
            return (
              <div
                key={list.id}
                onDragOver={(e) => onColumnDragOver(e, list.id)}
                onDrop={onColumnDrop}
                style={{
                  width: 280,
                  flexShrink: 0,
                  maxHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                  background: colors.columnBg,
                  borderRadius: 13,
                  border: `1px solid ${isTarget ? colors.accent : "#e3e4ec"}`,
                  transition: "border-color .15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px 9px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{list.title}</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: "#8b909b",
                        background: "#fff",
                        borderRadius: 20,
                        padding: "1px 8px",
                        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}
                    >
                      {list.cards.length}
                    </span>
                  </div>
                </div>

                <div className="tf-cards" style={{ padding: "2px 9px 4px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                  {list.cards.map((card) => {
                    const insBefore = isTarget && dragOverCardId === card.id && !dragOverAfter;
                    const insAfter = isTarget && dragOverCardId === card.id && dragOverAfter;
                    const hasDesc = !!(card.description && card.description.trim());
                    return (
                      <div key={card.id}>
                        {insBefore && <InsertionLine />}
                        <div
                          draggable
                          onClick={() => {
                            if (!dragCardId) setOpenCardId(card.id);
                          }}
                          onDragStart={(e) => onCardDragStart(e, card.id)}
                          onDragEnd={onCardDragEnd}
                          onDragOver={(e) => onCardDragOver(e, list.id, card.id)}
                          onDrop={onCardDrop}
                          style={{
                            background: "#fff",
                            border: "1px solid #e9eaef",
                            borderRadius: 9,
                            padding: "9px 11px",
                            margin: "4px 0",
                            boxShadow: "0 1px 2px rgba(20,22,40,.06)",
                            cursor: "pointer",
                            transition: "box-shadow .14s ease, transform .14s ease",
                          }}
                        >
                          <div style={{ fontSize: 13.5, lineHeight: 1.4, color: colors.textStrong }}>{card.title}</div>
                          {hasDesc && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 7, color: colors.textFaint }}>
                              <span style={{ fontSize: 12 }}>≡</span>
                            </div>
                          )}
                        </div>
                        {insAfter && <InsertionLine />}
                      </div>
                    );
                  })}

                  {showEndLine && <InsertionLine />}

                  {addingListId === list.id ? (
                    <form onSubmit={submitAddCard} style={{ margin: "4px 0 2px" }}>
                      <textarea
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={onAddCardKeyDown}
                        placeholder="Enter a title…"
                        rows={2}
                        autoFocus
                        style={{
                          width: "100%",
                          border: "1px solid #c9cadb",
                          borderRadius: 9,
                          padding: "8px 10px",
                          fontSize: 13.5,
                          outline: "none",
                          boxShadow: "0 1px 3px rgba(20,22,40,.08)",
                          lineHeight: 1.4,
                          fontFamily: "inherit",
                        }}
                      />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                        <button
                          type="submit"
                          style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 8, background: colors.accent, color: "#fff", fontSize: 13, fontWeight: 600 }}
                        >
                          Add card
                        </button>
                        <button
                          type="button"
                          onClick={cancelAddCard}
                          style={{ height: 32, width: 32, border: "none", borderRadius: 8, background: "none", color: "#8b909b", fontSize: 16 }}
                        >
                          ✕
                        </button>
                      </div>
                    </form>
                  ) : null}
                </div>

                {addingListId !== list.id && (
                  <button
                    onClick={() => startAddCard(list.id)}
                    style={{
                      margin: "5px 9px 10px",
                      height: 34,
                      border: "none",
                      background: "none",
                      borderRadius: 8,
                      color: colors.textMuted,
                      fontSize: 13.5,
                      textAlign: "left",
                      padding: "0 8px",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                    }}
                  >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                    <span>Add a card</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Add list */}
          <div style={{ width: 280, flexShrink: 0 }}>
            {addingList ? (
              <form onSubmit={submitAddList} style={{ background: colors.columnBg, borderRadius: 13, padding: 10 }}>
                <input
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="List title…"
                  autoFocus
                  style={{ width: "100%", height: 38, padding: "0 11px", border: "1px solid #c9cadb", borderRadius: 9, fontSize: 13.5, outline: "none" }}
                />
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <button
                    type="submit"
                    style={{ height: 32, padding: "0 14px", border: "none", borderRadius: 8, background: colors.accent, color: "#fff", fontSize: 13, fontWeight: 600 }}
                  >
                    Add list
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingList(false);
                      setNewListTitle("");
                    }}
                    style={{ height: 32, width: 32, border: "none", borderRadius: 8, background: "none", color: "#8b909b", fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => {
                  setAddingList(true);
                  setNewListTitle("");
                }}
                style={{
                  width: "100%",
                  height: 42,
                  border: "1.5px dashed #cdd0db",
                  background: "#fbfbfe9c",
                  borderRadius: 13,
                  color: "#7a7f8c",
                  fontSize: 13.5,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                <span>Add another list</span>
              </button>
            )}
          </div>
        </div>
      )}

      {openCard && (
        <CardModal
          card={openCard}
          listName={openCardListName}
          onClose={() => setOpenCardId(null)}
          onPatchCard={patchCard}
        />
      )}
    </div>
  );
}

function InsertionLine() {
  return <div style={{ height: 3, background: colors.accent, borderRadius: 2, margin: "3px 2px" }} />;
}
