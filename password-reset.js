/* V94: isolated password recovery. No profile, record or admin operations. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://yzqbjmupcklmyhwtjxdm.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Cq-omfEW9C9r6pnDWFEpVg_99jM80HS";
  const $ = id => document.getElementById(id);
  const link = new URL(window.location.href);
  const fragment = new URLSearchParams(link.hash.slice(1));
  const isCallback = link.searchParams.get("mode") === "recovery" || !!link.hash || link.searchParams.has("code");
  const hasLinkError = ["error", "error_code", "error_description"].some(key => fragment.has(key) || link.searchParams.has(key));
  let tokens = !hasLinkError && fragment.get("type") === "recovery" && fragment.get("access_token") && fragment.get("refresh_token")
    ? { access_token: fragment.get("access_token"), refresh_token: fragment.get("refresh_token") } : null;
  // Never leave credentials in navigation history or forward arbitrary URL params.
  for (const key of [...fragment.keys()]) fragment.delete(key);
  link.hash = "";
  link.search = isCallback ? "?mode=recovery" : "";
  try { window.history.replaceState(null, "", link.pathname + link.search); } catch { /* Referrer policy still suppresses URL sharing. */ }

  let client = null, recoveryUserId = null, sending = false, saving = false;
  let cooldownUntil = 0, cooldownTimer = null;
  const sentMessage = "If an account exists for this email, you will receive a reset link. Check your inbox and spam folder.";
  const invalidMessage = "This reset link is invalid or has expired. Request a new link below.";

  function status(id, text, type = "") {
    $(id).textContent = text;
    $(id).className = "status" + (type ? " " + type : "");
  }
  function panel(name) {
    for (const id of ["request", "checking", "password", "done"]) $(id + "Panel").hidden = id !== name;
    $("backToLogin").hidden = name === "done";
    $("pageTitle").textContent = name === "password" ? "Set a new password" : name === "done" ? "Password updated" : "Reset your password";
  }
  function passwordEnabled(enabled) {
    for (const id of ["resetPassword", "resetConfirm", "savePassword"]) $(id).disabled = !enabled;
  }
  function clearPasswords() {
    $("resetPassword").value = "";
    $("resetConfirm").value = "";
  }
  function updateSendButton() {
    const seconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
    $("sendReset").disabled = !client || sending || seconds > 0;
    $("sendReset").textContent = sending ? "Sending…" : seconds > 0 ? `Send again in ${seconds}s` : "Send reset link";
    if (!seconds && cooldownTimer) { clearInterval(cooldownTimer); cooldownTimer = null; }
  }
  function cooldown() {
    cooldownUntil = Date.now() + 60000;
    if (cooldownTimer) clearInterval(cooldownTimer);
    cooldownTimer = setInterval(updateSendButton, 1000);
    updateSendButton();
  }
  function sessionError(error) {
    return ["session_not_found", "session_expired", "refresh_token_not_found", "refresh_token_already_used", "bad_jwt", "user_not_found", "user_banned"].includes(error?.code) || error?.status === 401;
  }
  async function endRecoverySession() {
    recoveryUserId = null;
    passwordEnabled(false);
    clearPasswords();
    try { await client?.auth.signOut({ scope: "local" }); } catch { /* Memory-only client is discarded when this page closes. */ }
  }
  function requestError(error) {
    if (error?.status === 429 || ["over_email_send_rate_limit", "over_request_rate_limit"].includes(error?.code)) {
      cooldown();
      return "Too many requests. Please wait before trying again. If this continues, contact your administrator.";
    }
    if (["email_address_not_authorized", "captcha_failed"].includes(error?.code)) {
      return "Password reset emails are not available right now. Please contact your administrator.";
    }
    if (error?.code === "email_address_invalid") return "Please enter a valid email address.";
    return "We couldn’t send the reset email. Check your connection and try again, or contact your administrator.";
  }

  $("requestForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!client || sending || saving || Date.now() < cooldownUntil || !$("requestForm").reportValidity()) return;
    const email = $("resetEmail").value.trim();
    sending = true;
    $("resetEmail").disabled = true;
    updateSendButton();
    status("requestStatus", "Sending reset link…");
    const redirect = new URL("password-reset.html", window.location.href);
    redirect.search = "?mode=recovery"; redirect.hash = "";
    try {
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: redirect.href });
      // Do not disclose whether an account exists or whether it is archived.
      if (error && !["user_not_found", "user_banned"].includes(error.code)) throw error;
      status("requestStatus", sentMessage, "success");
      cooldown();
    } catch (error) {
      status("requestStatus", requestError(error), "error");
    } finally {
      sending = false;
      $("resetEmail").disabled = false;
      updateSendButton();
    }
  });

  $("resetForm").addEventListener("submit", async event => {
    event.preventDefault();
    if (!client || saving || !recoveryUserId || !$("resetForm").reportValidity()) return;
    const password = $("resetPassword").value, confirmation = $("resetConfirm").value;
    if (password.length < 8) return status("passwordStatus", "Use at least 8 characters.", "error");
    if (new TextEncoder().encode(password).length > 72) return status("passwordStatus", "This password is too long. Please use a shorter password.", "error");
    if (password !== confirmation) return status("passwordStatus", "Passwords do not match.", "error");
    saving = true;
    passwordEnabled(false);
    status("passwordStatus", "Saving your new password…");
    try {
      const { data, error } = await client.auth.updateUser({ password });
      if (error) throw error;
      if (!data?.user?.id || data.user.id !== recoveryUserId) throw new Error("Password update was not confirmed");
      await endRecoverySession();
      panel("done");
      $("pageTitle").focus();
    } catch (error) {
      if (sessionError(error)) {
        await endRecoverySession();
        panel("request");
        status("requestStatus", invalidMessage, "error");
      } else if (error?.code === "same_password") {
        status("passwordStatus", "Choose a password different from your current one.", "error");
      } else if (error?.code === "weak_password") {
        status("passwordStatus", error.message || "Choose a stronger password that meets your company’s password rules.", "error");
      } else if (["reauthentication_needed", "insufficient_aal"].includes(error?.code)) {
        status("passwordStatus", "Your account requires additional verification. Please contact your administrator.", "error");
      } else {
        status("passwordStatus", "We couldn’t confirm the password change. Check your connection and try again. If it was already saved, use it to sign in.", "error");
      }
    } finally {
      saving = false;
      passwordEnabled(!!recoveryUserId);
    }
  });

  async function start() {
    try {
      if (!window.supabase?.createClient) throw new Error("Auth library unavailable");
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: { storageKey: "etimer-password-recovery", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, flowType: "implicit" }
      });
    } catch {
      tokens = null;
      status("requestStatus", "Password recovery couldn’t load. Check your connection and reopen this page.", "error");
      return;
    }
    $("resetEmail").disabled = false;
    updateSendButton();
    status("requestStatus", "");
    if (!tokens) {
      if (isCallback) status("requestStatus", invalidMessage, "error");
      return;
    }
    panel("checking");
    try {
      // Auth verifies the incoming recovery credentials; no pre-existing app session is used.
      const { data, error } = await client.auth.setSession(tokens);
      if (error) throw error;
      if (!data?.user?.id || data.session?.user?.id !== data.user.id) throw new Error("Missing recovery session");
      recoveryUserId = data.user.id;
      $("recoveryAccount").textContent = data.user.email || "";
      panel("password");
      passwordEnabled(true);
      $("resetPassword").focus();
    } catch {
      await endRecoverySession();
      panel("request");
      status("requestStatus", "We couldn’t verify this reset link. Check your connection and request a new link.", "error");
    } finally { tokens = null; }
  }
  // Recovery credentials/passwords are never written to browser storage or logs.
  // Reloading the page intentionally requires a new link; the app session is untouched.
  start();
})();
