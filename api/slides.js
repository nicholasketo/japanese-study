export default async function handler(req, res) {
  const SLIDES_ID = "1hjIHWKu2J7KWjqbMntTTDvC6ZtknT1tENej5SpJE9EY";
  const url = `https://docs.google.com/presentation/d/${SLIDES_ID}/export?format=txt`;

  try {
    const response = await fetch(url, { redirect: "follow" });
    if (!response.ok) throw new Error(`Google returned ${response.status}`);
    const text = await response.text();
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ text, fetchedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
