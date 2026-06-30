import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, apiErrorMessage } from "../api";
import { colors } from "../tokens";

/**
 * Shared shell for Login and Register. `mode` is "login" or "register".
 */
const DEMO_EMAIL = "demo@taskflow.app";
const DEMO_PASSWORD = "password";

export default function AuthShell({ mode }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function doLogin(loginEmail, loginPassword) {
    const loginRes = await api.login({ email: loginEmail, password: loginPassword });
    const user = { username: loginEmail.split("@")[0], email: loginEmail };
    login(loginRes.access_token, user);
    navigate("/dashboard");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password || (!isLogin && !username)) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await doLogin(email, password);
      } else {
        await api.register({ username, email, password });
        const user = { username, email };
        const loginRes = await api.login({ email, password });
        login(loginRes.access_token, user);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(apiErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setError("");
    setDemoLoading(true);
    try {
      await doLogin(DEMO_EMAIL, DEMO_PASSWORD);
    } catch (err) {
      setError(apiErrorMessage(err, "Demo account unavailable."));
    } finally {
      setDemoLoading(false);
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
            <div style={{ position: "relative" }}>
              <TextInput
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isLogin ? "current-password" : "new-password"}
                style={{ marginBottom: 7, paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 4,
                  top: 11,
                  width: 30,
                  height: 30,
                  border: "none",
                  background: "none",
                  color: colors.textFaint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

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
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12.5, color: "#5a5a8a", lineHeight: 1.5 }}>
                Want to look around first? Try a demo account.
              </span>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoLoading}
                style={{
                  height: 30,
                  padding: "0 12px",
                  border: `1px solid ${colors.accent}`,
                  borderRadius: 7,
                  background: "#fff",
                  color: colors.accent,
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: demoLoading ? "default" : "pointer",
                }}
              >
                {demoLoading && <Spinner size={12} color={colors.accent} />}
                <span>Try demo account</span>
              </button>
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

function EyeIcon({ open }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {open ? (
        <>
          <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 7 11 7a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61C3.93 8.36 2 11 1 12c0 0 4 7 11 7a10.4 10.4 0 0 0 5.39-1.61" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
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
