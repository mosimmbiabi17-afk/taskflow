import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../api";
import { colors } from "../tokens";

/**
 * Shared shell for Login and Register. `mode` is "login" or "register".
 */
export default function AuthShell({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let loginRes;
      if (isLogin) {
        loginRes = await api.login({ email, password });
      } else {
        await api.register({ username, email, password });
        loginRes = await api.login({ email, password });
      }
      const user = { username: username || email.split("@")[0], email };
      login(loginRes.access_token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          background: colors.appBg,
        }}
      >
        <div style={{ width: "100%", maxWidth: 380 }}>
          {/* Brand lockup */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 30 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(91,91,214,.35)",
              }}
            >
              <div style={{ display: "flex", gap: 2.5 }}>
                <div style={{ width: 4, height: 13, background: "#fff", borderRadius: 1 }} />
                <div style={{ width: 4, height: 9, background: "#fff", borderRadius: 1, opacity: 0.7 }} />
              </div>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-.02em" }}>TaskFlow</div>
          </div>

          <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 6 }}>
            {isLogin ? "Welcome back" : "Create your account"}
          </div>
          <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 26 }}>
            {isLogin ? "Log in to pick up where you left off." : "Start organizing work in minutes."}
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <Label>Username</Label>
                <TextInput
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="jane"
                  autoComplete="username"
                />
              </>
            )}

            <Label>Email</Label>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
            />

            <Label>Password</Label>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={isLogin ? "current-password" : "new-password"}
              style={{ marginBottom: 7 }}
            />

            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  background: colors.dangerBg,
                  color: colors.dangerStrong,
                  fontSize: 13,
                  padding: "9px 12px",
                  borderRadius: 8,
                  margin: "8px 0 4px",
                }}
              >
                <span style={{ fontSize: 14 }}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 44,
                marginTop: 14,
                border: "none",
                borderRadius: 9,
                background: colors.accent,
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                boxShadow: "0 4px 12px rgba(91,91,214,.3)",
                cursor: loading ? "default" : "pointer",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = colors.accentHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = colors.accent)}
            >
              {loading && <Spinner size={15} />}
              <span>{isLogin ? "Log in" : "Create account"}</span>
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: 13.5, color: colors.textMuted, textAlign: "center" }}>
            <span>{isLogin ? "New to TaskFlow? " : "Already have an account? "}</span>
            <Link
              to={isLogin ? "/register" : "/login"}
              style={{ color: colors.accent, fontWeight: 600, textDecoration: "none" }}
            >
              {isLogin ? "Create one" : "Log in"}
            </Link>
          </div>

          {isLogin && (
            <div
              style={{
                marginTop: 24,
                padding: "11px 13px",
                background: colors.accentChip,
                border: "1px dashed #cfcff0",
                borderRadius: 9,
                fontSize: 12.5,
                color: "#5a5a8a",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                lineHeight: 1.6,
              }}
            >
              demo · demo@taskflow.app / password
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1.05,
          minWidth: 0,
          background: "linear-gradient(150deg,#5b5bd6,#7a6ef0 55%,#9b6ef0)",
          display: "none",
          position: "relative",
          overflow: "hidden",
        }}
        className="tf-authart"
      />
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: colors.textLabel, marginBottom: 6 }}>
      {children}
    </label>
  );
}

function TextInput({ style, ...props }) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        height: 42,
        padding: "0 13px",
        marginBottom: 15,
        border: `1px solid ${colors.borderInput}`,
        borderRadius: 9,
        fontSize: 14,
        outline: "none",
        background: "#fff",
        ...style,
      }}
      onFocus={(e) => {
        e.target.style.borderColor = colors.accent;
        e.target.style.boxShadow = `0 0 0 3px ${colors.accentRing}`;
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.borderInput;
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export function Spinner({ size = 16, color = "#fff" }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,.5)`,
        borderTopColor: color,
        borderRadius: "50%",
        display: "inline-block",
        animation: "tf-spin .7s linear infinite",
      }}
    />
  );
}
