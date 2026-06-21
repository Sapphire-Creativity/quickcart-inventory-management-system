"use client";

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { useSignUp } from "@clerk/nextjs";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 59;

export default function EmailVerificationPage() {
  const { signUp } = useSignUp();

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN);
  const [resendMsg, setResendMsg] = useState("");
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const email = signUp?.emailAddress ?? "";
  const isFilled = digits.every((d) => d !== "");
  const canResend = secondsLeft === 0;

  /* ── Timer ── */
  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, []);

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startTimer() {
    clearTimer();
    setSecondsLeft(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { clearTimer(); return 0; }
        return s - 1;
      });
    }, 1000);
  }

  function formatTimer(s: number) {
    return `0:${String(s).padStart(2, "0")}`;
  }

  /* ── Input Handlers ── */
  function handleChange(e: ChangeEvent<HTMLInputElement>, idx: number) {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setErrorMsg("");
    if (val && idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, idx: number) {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const next = [...digits];
        next[idx - 1] = "";
        setDigits(next);
        inputRefs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      }
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && idx > 0) inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < CODE_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  }

  /* ── Verify ── */
  async function handleVerify() {
    if (!isFilled || status === "loading" || !signUp) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      await signUp.verifications.verifyEmailCode({ code: digits.join("") });

      if (signUp.status === "complete") {
        await signUp.finalize({
          navigate: ({ decorateUrl }) => {
            const url = decorateUrl("/dashboard");
            window.location.href = url;
          },
        });
        setStatus("success");
      } else {
        setErrorMsg("Verification incomplete. Please try again.");
        setStatus("idle");
      }
    } catch (err: any) {
      const msg: string = err.errors?.[0]?.longMessage ?? "Incorrect code. Please try again.";
      setErrorMsg(msg);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setDigits(Array(CODE_LENGTH).fill(""));
      setStatus("idle");
      inputRefs.current[0]?.focus();
    }
  }

  /* ── Resend ── */
  async function handleResend() {
    if (!canResend || !signUp) return;
    try {
      await signUp.verifications.sendEmailCode();
      setDigits(Array(CODE_LENGTH).fill(""));
      setErrorMsg("");
      setStatus("idle");
      setResendMsg("A new code has been sent.");
      startTimer();
      inputRefs.current[0]?.focus();
      setTimeout(() => setResendMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.errors?.[0]?.longMessage ?? "Failed to resend. Please try again.");
    }
  }

  /* ── Success Screen ── */
  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-full max-w-sm">
          <div className="card text-center py-10 px-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "#dcfce7" }}
            >
              <svg
                width="28" height="28" viewBox="0 0 28 28"
                fill="none" stroke="#16a34a"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "draw 0.45s 0.05s ease forwards" }}
              >
                <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>
                <path d="M4 14l8 8L24 6" />
              </svg>
            </div>
            <h3 className="mb-2" style={{ fontFamily: "var(--font-display)" }}>Email verified!</h3>
            <p className="mb-1">Your account is confirmed.</p>
            <p>Redirecting you now…</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main Form ── */
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="w-full max-w-sm space-y-6">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--color-brand-500)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 7l10 7 10-7" />
            </svg>
          </div>
          <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}>
            QuickCart
          </span>
        </div>

        {/* Card */}
        <div className="card !p-8 space-y-6">

          {/* Header */}
          <div>
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "#d1fae5" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-600)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
            </div>
            <h4 className="mb-1" style={{ fontFamily: "var(--font-display)" }}>Check your inbox</h4>
            <p className="text-sm" style={{ color: "var(--color-muted)" }}>
              We sent a 6-digit code to{" "}
              {email && (
                <span className="font-medium" style={{ color: "var(--color-text)" }}>{email}</span>
              )}
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "var(--color-border)" }} />

          {/* OTP Inputs */}
          <div>
            <label
              className="block text-xs font-medium uppercase tracking-widest mb-3"
              style={{ color: "var(--color-muted)" }}
            >
              Verification code
            </label>

            <div
              className={shake ? "animate-[shake_0.35s_ease]" : ""}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${CODE_LENGTH}, minmax(0, 52px))`,
                gap: "8px",
              }}
            >
              <style>{`
                @keyframes shake {
                  0%,100% { transform: translateX(0); }
                  20%     { transform: translateX(-5px); }
                  40%     { transform: translateX(5px);  }
                  60%     { transform: translateX(-4px); }
                  80%     { transform: translateX(4px);  }
                }
              `}</style>

              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="number"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={status === "loading"}
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  autoFocus={idx === 0}
                  onChange={(e) => handleChange(e, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={[
                    "w-full h-12 text-center text-lg font-semibold rounded-xl border transition-all duration-150",
                    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    "focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-[var(--color-brand-500)]",
                    errorMsg
                      ? "border-[var(--color-danger)] bg-red-50"
                      : digit
                        ? "border-[var(--color-brand-500)] bg-white"
                        : "border-[var(--color-border)] bg-white",
                  ].join(" ")}
                  style={{ fontFamily: "var(--font-mono, monospace)", color: "var(--color-text)" }}
                />
              ))}
            </div>

            {/* Error / Resend feedback */}
            <div className="mt-2.5 min-h-[18px]">
              {errorMsg && (
                <p className="text-xs" style={{ color: "var(--color-danger)" }}>{errorMsg}</p>
              )}
              {resendMsg && !errorMsg && (
                <p className="text-xs" style={{ color: "var(--color-success)" }}>{resendMsg}</p>
              )}
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={!isFilled || status === "loading" || !signUp}
            className="btn btn-primary btn-lg w-full rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {status === "loading" ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                Verifying…
              </>
            ) : (
              "Verify email"
            )}
          </button>

          {/* Resend row */}
          <div className="flex items-center justify-center gap-1.5 text-sm" style={{ color: "var(--color-muted)" }}>
            <span>Didn&apos;t get it?</span>
            <button
              onClick={handleResend}
              disabled={!canResend}
              className="font-medium transition-colors disabled:cursor-not-allowed"
              style={{ color: canResend ? "var(--color-brand-500)" : "var(--color-muted)" }}
            >
              Resend code
            </button>
            {!canResend && (
              <span className="text-xs tabular-nums" style={{ color: "var(--color-muted)" }}>
                {formatTimer(secondsLeft)}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs" style={{ color: "var(--color-muted)" }}>
          Wrong email?{" "}
          <a href="/" className="font-medium" style={{ color: "var(--color-brand-500)" }}>
            Go back and change it.
          </a>
        </p>

      </div>
    </div>
  );
}