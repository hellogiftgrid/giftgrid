"use client";

import { useState } from "react";

export default function UserRoleControls({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/admin/users/role",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            userId,
            role,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to update role."
        );
      }

      setMessage("Role saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update role."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={role}
        onChange={(event) =>
          setRole(event.target.value)
        }
        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
      >
        <option value="merchant">
          Merchant
        </option>

        <option value="corporate_buyer">
          Gifting Team
        </option>
      </select>

      <button
        type="button"
        onClick={save}
        disabled={saving || role === currentRole}
        className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving..." : "Save"}
      </button>

      {message && (
        <span className="text-xs font-semibold text-emerald-600">
          {message}
        </span>
      )}

      {error && (
        <span className="text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
