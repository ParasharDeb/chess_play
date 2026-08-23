"use client";
import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

/* ─────────────────────────── styles ─────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500&display=swap');

  :root {
    --bg:        #0a0a0a;
    --surface:   #111111;
    --surface2:  #161616;
    --border:    rgba(255,255,255,0.07);
    --border-h:  rgba(255,255,255,0.16);
    --accent:    #ffffff;
    --muted:     rgba(255,255,255,0.35);
    --muted2:    rgba(255,255,255,0.55);
    --grid-line: rgba(255,255,255,0.035);
    --error:     rgba(248,113,113,0.9);
    --error-bg:  rgba(248,113,113,0.06);
    --error-bd:  rgba(248,113,113,0.25);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-root {
    min-height: 100vh;
    background-color: var(--bg);
    background-image:
      linear-gradient(var(--grid-line) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
    background-size: 60px 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    color: var(--accent);
    padding: 48px 24px;
    position: relative;
    overflow: hidden;
  }

  .auth-wm {
    position: fixed;
    pointer-events: none;
    font-size: 220px;
    line-height: 1;
    opacity: 0.025;
    user-select: none;
    z-index: 0;
  }
  .auth-wm-tl { top: -20px; left: -20px; }
  .auth-wm-br { bottom: -20px; right: -20px; }

  /* ── card ── */
  .auth-card {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
  }

  /* top accent bar */
  .auth-card::before {
    content: '';
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
  }

  .auth-body {
    padding: 40px 40px 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  /* ── header ── */
  .auth-header {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .auth-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255,255,255,0.05);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 12px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    width: fit-content;
  }

  .auth-headline {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 900;
    letter-spacing: -0.02em;
    line-height: 1.05;
  }

  .auth-headline em {
    font-style: italic;
    color: var(--muted2);
  }

  .auth-sub {
    font-size: 13px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.5;
  }

  /* ── google btn ── */
  .auth-google {
    width: 100%;
    padding: 12px 16px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.15s, border-color 0.15s;
    letter-spacing: 0.01em;
  }

  .auth-google:hover {
    background: rgba(255,255,255,0.06);
    border-color: var(--border-h);
  }

  /* ── divider ── */
  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .auth-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .auth-divider-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
  }

  /* ── form ── */
  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .auth-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .auth-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .auth-forgot {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.15s;
  }
  .auth-forgot:hover { color: var(--accent); }

  .auth-input {
    width: 100%;
    padding: 11px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--accent);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, background 0.15s;
  }

  .auth-input::placeholder { color: var(--muted); }

  .auth-input:focus {
    border-color: var(--border-h);
    background: rgba(255,255,255,0.04);
  }

  /* ── submit ── */
  .auth-submit {
    width: 100%;
    padding: 13px 24px;
    background: var(--accent);
    color: var(--bg);
    border: none;
    border-radius: 4px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: opacity 0.15s, transform 0.1s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-top: 4px;
  }

  .auth-submit:hover:not(:disabled)  { opacity: 0.85; transform: translateY(-1px); }
  .auth-submit:active:not(:disabled) { opacity: 0.7;  transform: translateY(0); }
  .auth-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* spinner */
  .auth-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.2);
    border-top-color: #000;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── error message ── */
  .auth-error {
    padding: 10px 14px;
    background: var(--error-bg);
    border: 1px solid var(--error-bd);
    border-radius: 4px;
    color: var(--error);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
    text-align: center;
  }

  /* ── footer link ── */
  .auth-footer {
    text-align: center;
    font-size: 13px;
    color: var(--muted);
    padding-bottom: 4px;
  }

  .auth-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.15s;
  }

  .auth-footer a:hover { opacity: 0.7; }

  /* ── bottom strip ── */
  .auth-strip {
    border-top: 1px solid var(--border);
    padding: 14px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .auth-strip-piece {
    font-size: 18px;
    opacity: 0.15;
    user-select: none;
  }

  .auth-strip-text {
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
  }
`;

const containerVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.4 } },
};

export default function SignupPage() {
  const [email,    setEmail]    = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [message,  setMessage]  = useState("");
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`http://${process.env.NEXT_PUBLIC_IP_ADDRESS}/signup`, {
        username,
        password,
        email,
      });
      setLoading(false);
      router.push("/signin");
    } catch (error) {
      console.log(error);
      setLoading(false);
      setMessage("Something went wrong. Please try again.");
    }
  }

  async function handleGoogleSignup() {
    console.log("Google OAuth signup");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="auth-wm auth-wm-tl" aria-hidden>♚</div>
      <div className="auth-wm auth-wm-br" aria-hidden>♟</div>

      <div className="auth-root">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}
        >
          <div className="auth-card">
            <div className="auth-body">

              {/* header */}
              <motion.div variants={itemVariants} className="auth-header">
                <span className="auth-eyebrow">♟ New Account</span>
                <h1 className="auth-headline">Join the<br /><em>board.</em></h1>
                <p className="auth-sub">Create an account and start your journey.</p>
              </motion.div>

              {/* google */}
              <motion.div variants={itemVariants}>
                <button className="auth-google" type="button" onClick={handleGoogleSignup}>
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </motion.div>

              {/* divider */}
              <motion.div variants={itemVariants} className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or email</span>
                <div className="auth-divider-line" />
              </motion.div>

              {/* form */}
              <form className="auth-form" onSubmit={handleSignup}>
                <motion.div variants={itemVariants} className="auth-field">
                  <label htmlFor="email" className="auth-label">Email</label>
                  <input
                    id="email" type="email" className="auth-input"
                    placeholder="you@example.com" required
                    value={email} onChange={e => setEmail(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="auth-field">
                  <label htmlFor="username" className="auth-label">Username</label>
                  <input
                    id="username" type="text" className="auth-input"
                    placeholder="Choose a username" required
                    value={username} onChange={e => setUsername(e.target.value)}
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="auth-field">
                  <label htmlFor="password" className="auth-label">Password</label>
                  <input
                    id="password" type="password" className="auth-input"
                    placeholder="Create a password" required
                    value={password} onChange={e => setPassword(e.target.value)}
                  />
                </motion.div>

                {message && (
                  <motion.div
                    className="auth-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {message}
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <button type="submit" className="auth-submit" disabled={loading} onClick={handleSignup}>
                    {loading ? <><span className="auth-spinner" /> Creating account…</> : "Create Account"}
                  </button>
                </motion.div>
              </form>

              {/* footer */}
              <motion.div variants={itemVariants} className="auth-footer">
                Already have an account? <a href="/signin">Sign in</a>
              </motion.div>

            </div>

            {/* bottom strip */}
            <div className="auth-strip">
              <span className="auth-strip-piece">♜</span>
              <span className="auth-strip-text">Secure · Encrypted</span>
              <span className="auth-strip-piece">♝</span>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}