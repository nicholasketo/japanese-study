import crypto from "crypto";

const hashPin = (pin) => crypto.createHash("sha256").update(String(pin)).digest("hex");

const query = async (path, options = {}) => {
  const resp = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
  });
  return resp.json();
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const { action, username, pin } = req.body;

  try {
    if (action === "list") {
      const data = await query("profiles?select=id,username,created_at&order=created_at.asc");
      return res.json({ profiles: Array.isArray(data) ? data : [] });
    }

    if (action === "register") {
      if (!username?.trim() || !pin || String(pin).length < 4) {
        return res.status(400).json({ error: "Name and 4+ digit PIN required" });
      }
      const data = await query("profiles", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), pin_hash: hashPin(pin) }),
      });
      if (!Array.isArray(data) || !data.length) {
        return res.status(400).json({ error: "Username already taken" });
      }
      return res.json({ userId: data[0].id, username: data[0].username });
    }

    if (action === "login") {
      if (!username?.trim() || !pin) {
        return res.status(400).json({ error: "Name and PIN required" });
      }
      const data = await query(
        `profiles?username=eq.${encodeURIComponent(username.trim())}&pin_hash=eq.${hashPin(pin)}&select=id,username,progress,time_data`
      );
      if (!Array.isArray(data) || !data.length) {
        return res.status(401).json({ error: "Wrong name or PIN" });
      }
      return res.json({
        userId: data[0].id,
        username: data[0].username,
        progress: data[0].progress,
        timeData: data[0].time_data,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
