export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GEMINI_API_KEY not configured" });

  const SLIDES_ID = "1hjIHWKu2J7KWjqbMntTTDvC6ZtknT1tENej5SpJE9EY";
  const slidesUrl = `https://docs.google.com/presentation/d/${SLIDES_ID}/export?format=txt`;

  try {
    // Step 1: Fetch raw slides text
    const slideResp = await fetch(slidesUrl, { redirect: "follow" });
    if (!slideResp.ok) throw new Error(`Google returned ${slideResp.status}`);
    const rawText = await slideResp.text();

    // Step 2: Build prompt
    const prompt = `You are a data extraction assistant. Parse the following raw text exported from Google Slides containing Japanese language lessons. Extract ALL vocabulary and grammar from EVERY lesson.

OUTPUT FORMAT: Return ONLY valid JSON matching this exact schema:

{
  "lessons": {
    "1": {
      "title": "Lesson 1 – <topic>",
      "vocab": [
        { "jp": "<hiragana/katakana>", "roma": "<romaji>", "en": "<English>" }
      ],
      "grammar": [
        { "jp": "<Japanese pattern>", "en": "<English meaning>", "roma": "<romaji>" }
      ]
    }
  },
  "greetings": [
    { "jp": "<Japanese>", "roma": "<romaji>", "en": "<English>" }
  ]
}

RULES:
1. Each lesson is numbered starting from 1
2. Title format: "Lesson N – <Topic>"
3. vocab items are single words or short compounds. Fields: jp (Japanese script), roma (romaji), en (English)
4. grammar items are sentence patterns or phrases. Fields: jp, en, roma
5. greetings are common Japanese greetings/expressions (aisatsu) found in the slides
6. Include ALL items from EVERY lesson — be exhaustive, do not skip anything
7. Use hiragana/katakana for jp field (not kanji), matching what appears in the slides
8. For grammar patterns, use placeholders like {NAME}, {NOUN}, {PLACE} where appropriate

RAW SLIDES TEXT:
${rawText}`;

    // Step 3: Call Gemini (use lite model to avoid sharing quota with chat)
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    const geminiData = await geminiResp.json();
    if (geminiData.error) throw new Error(`Gemini API error: ${JSON.stringify(geminiData.error)}`);
    const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!geminiText) {
      const reason = geminiData.candidates?.[0]?.finishReason || "unknown";
      throw new Error(`Empty Gemini response (finishReason: ${reason}, raw: ${JSON.stringify(geminiData).slice(0, 500)})`);
    }

    // Step 4: Parse and validate
    let parsed;
    try {
      parsed = JSON.parse(geminiText);
    } catch {
      const match = geminiText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) parsed = JSON.parse(match[1]);
      else throw new Error("Gemini returned non-JSON response");
    }

    if (!parsed.lessons || typeof parsed.lessons !== "object") {
      throw new Error("Missing lessons object in response");
    }

    for (const [id, lesson] of Object.entries(parsed.lessons)) {
      if (!lesson.title || !Array.isArray(lesson.vocab) || !Array.isArray(lesson.grammar)) {
        throw new Error(`Invalid lesson ${id}: missing title, vocab, or grammar`);
      }
    }

    // Step 5: Return with cache headers
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({
      lessons: parsed.lessons,
      greetings: parsed.greetings || [],
      fetchedAt: new Date().toISOString(),
      source: "gemini-parsed",
    });
  } catch (e) {
    console.error("parse-slides error:", e.message);
    res.status(500).json({ error: e.message, source: "parse-slides" });
  }
}
