import { useAuth } from "../context/AuthContext";
import { colors } from "../tokens";

export default function TopBar({ user }) {
  const { logout } = useAuth();
  const userName = user?.username || (user?.email ? user.email.split("@")[0] : "You");
  const userInitial = (userName[0] || "U").toUpperCase();

  return (
    <div
      style={{
        height: 58,
        background: "#fff",
        borderBottom: `1px solid ${colors.borderLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 22px",
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: colors.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            <div style={{ width: 3.5, height: 11, background: "#fff", borderRadius: 1 }} />
            <div style={{ width: 3.5, height: 8, background: "#fff", borderRadius: 1, opacity: 0.7 }} />
          </div>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.02em" }}>TaskFlow</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 13.5, color: colors.textLabel }}>{userName}</div>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: colors.accent,
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {userInitial}
        </div>
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "1px solid #e0e2e8",
            height: 30,
            padding: "0 12px",
            borderRadius: 8,
            fontSize: 13,
            color: colors.textMuted,
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
