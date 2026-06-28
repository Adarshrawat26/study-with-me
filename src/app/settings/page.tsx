"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/components/layout/PageHeader";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData, (c) => c.charCodeAt(0)));
}

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [defaultMode, setDefaultMode] = useState("pomodoro");
  const [defaultDuration, setDefaultDuration] = useState(25);
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.name) setName(data.profile.name);
        const s = data.settings;
        if (s) {
          setDefaultMode(s.defaultMode ?? "pomodoro");
          setDefaultDuration(Math.floor((s.defaultDuration ?? 1500) / 60));
          setWorkDuration(Math.floor((s.workDuration ?? 1500) / 60));
          setBreakDuration(Math.floor((s.breakDuration ?? 300) / 60));
          setAutoStartBreaks(s.autoStartBreaks ?? false);
          setPushEnabled(s.pushEnabled ?? false);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          defaultMode,
          defaultDuration: defaultDuration * 60,
          workDuration: workDuration * 60,
          breakDuration: breakDuration * 60,
          autoStartBreaks,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      await update({ name });
      toast("Settings saved!", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) return;
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change-password", currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      toast("Password updated!", "success");
      setCurrentPassword("");
      setNewPassword("");
    } else {
      toast(data.error ?? "Failed to change password", "error");
    }
  };

  const enablePush = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast("Push notifications not supported", "error");
      return;
    }

    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      toast("Notifications denied", "error");
      return;
    }

    const { publicKey } = await fetch("/api/push/vapid").then((r) => r.json());
    if (!publicKey) {
      toast("Push not configured — add VAPID keys to .env", "error");
      return;
    }

    const reg = await navigator.serviceWorker.register("/sw.js");
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = sub.toJSON();
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: json.keys,
      }),
    });

    setPushEnabled(true);
    toast("Push notifications enabled!", "success");
  };

  const resetAnalytics = async () => {
    setResetting(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-analytics" }),
      });
      if (!res.ok) throw new Error("Failed");
      toast("Analytics reset — tracking starts fresh!", "success");
      setResetConfirm(false);
    } catch {
      toast("Failed to reset analytics", "error");
    } finally {
      setResetting(false);
    }
  };

  const deleteAccount = async () => {
    const res = await fetch("/api/settings", { method: "DELETE" });
    if (res.ok) {
      toast("Account deleted", "info");
      signOut({ callbackUrl: "/" });
    } else {
      toast("Failed to delete account", "error");
    }
  };

  if (loading) {
    return (
      <div className="page-shell-narrow">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="page-shell-narrow">
      <PageHeader title="Settings" subtitle="Account and timer preferences" />

      <div className="space-y-6">
        <section className="glass-card p-6">
          <h2 className="section-title mb-4">Profile</h2>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display name" className="input-field" />
            <p className="text-xs text-[var(--text-muted)]">{session?.user?.email}</p>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="section-title mb-4">Notifications</h2>
          <button onClick={enablePush} className="btn-secondary" disabled={pushEnabled}>
            {pushEnabled ? "Push notifications enabled" : "Enable push notifications"}
          </button>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Daily streak reminders at 6 PM IST
          </p>
        </section>

        <section className="glass-card p-6">
          <h2 className="section-title mb-4">Timer defaults</h2>
          <div className="space-y-3">
            <select value={defaultMode} onChange={(e) => setDefaultMode(e.target.value)} className="input-field">
              <option value="pomodoro">Pomodoro</option>
              <option value="stopwatch">Stopwatch</option>
              <option value="countdown">Countdown</option>
            </select>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-[var(--text-muted)]">
                Default (min)
                <input type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(+e.target.value)} className="input-field mt-1" />
              </label>
              <label className="text-xs text-[var(--text-muted)]">
                Work (min)
                <input type="number" value={workDuration} onChange={(e) => setWorkDuration(+e.target.value)} className="input-field mt-1" />
              </label>
              <label className="text-xs text-[var(--text-muted)]">
                Break (min)
                <input type="number" value={breakDuration} onChange={(e) => setBreakDuration(+e.target.value)} className="input-field mt-1" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={autoStartBreaks} onChange={(e) => setAutoStartBreaks(e.target.checked)} className="accent-[var(--primary)]" />
              Auto-start breaks
            </label>
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="section-title mb-4">Change password</h2>
          <div className="space-y-3">
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="input-field" />
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="input-field" />
            <button onClick={changePassword} className="btn-secondary">Update Password</button>
          </div>
        </section>

        <button onClick={saveSettings} disabled={saving} className="btn-primary w-full">
          {saving ? "Saving..." : "Save All Settings"}
        </button>

        <section className="glass-card border-pink-200 p-6">
          <h2 className="section-title mb-2">Reset analytics</h2>
          <p className="mb-4 text-sm text-[var(--text-muted)]">
            Clear all study sessions, streaks, plant progress, and goal progress. Your account, labels, and goals stay — analytics start from zero.
          </p>
          {!resetConfirm ? (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className="rounded-xl border border-pink-300 px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50"
            >
              Reset all analytics
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-pink-700">This cannot be undone. Continue?</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetAnalytics}
                  disabled={resetting}
                  className="rounded-xl bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 disabled:opacity-50"
                >
                  {resetting ? "Resetting..." : "Yes, reset everything"}
                </button>
                <button type="button" onClick={() => setResetConfirm(false)} className="btn-secondary text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="glass-card border-red-500/30 p-6">
          <h2 className="section-title mb-4 text-red-400">Danger zone</h2>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} className="rounded-xl border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10">
              Delete Account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-red-400">This permanently deletes all your data. Are you sure?</p>
              <div className="flex gap-2">
                <button onClick={deleteAccount} className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-400">Yes, delete</button>
                <button onClick={() => setDeleteConfirm(false)} className="btn-secondary text-sm">Cancel</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
