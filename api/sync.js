export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const { action, userId, progress, timeData } = req.body;
  if (!userId) return res.status(400).json({ error: "userId required" });

  const headers = {
    apikey: process.env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    if (action === "load") {
      const resp = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=progress,time_data`,
        { headers }
      );
      const data = await resp.json();
      if (!Array.isArray(data) || !data.length) return res.status(404).json({ error: "Profile not found" });
      return res.json({ progress: data[0].progress, timeData: data[0].time_data });
    }

    if (action === "save") {
      const resp = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({
            progress: progress || {},
            time_data: timeData || {},
            updated_at: new Date().toISOString(),
          }),
        }
      );
      if (!resp.ok) return res.status(500).json({ error: "Sync failed" });
      return res.json({ ok: true });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch {
    return res.status(500).json({ error: "Server error" });
  }
}
