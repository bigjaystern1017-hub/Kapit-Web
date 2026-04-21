import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const factoidCache = new Map<string, { factoids: Factoid[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

interface Factoid {
  factoid: string;
  year: string;
  category: string;
}

router.post("/kapit/factoids", async (req, res) => {
  try {
    const { lat, lng, locationName } = req.body as {
      lat: number;
      lng: number;
      locationName: string;
    };

    if (lat === undefined || lng === undefined || !locationName) {
      res.status(400).json({ error: "lat, lng, and locationName are required" });
      return;
    }

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = factoidCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({ factoids: cached.factoids, cached: true });
      return;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: `You are a brilliant, slightly insufferable cocktail party historian. Give me 5 fascinating, unexpected, conversation-worthy historical factoids about places within roughly 10 miles of these coordinates: ${lat}, ${lng} (near ${locationName}).

Rules:
- Each factoid must be about a DIFFERENT topic, person, and location. Never repeat a fact you have already given. Spread the facts across different neighborhoods and areas within the radius. Mix hyperlocal facts (about this exact block) with broader area facts (within 10 miles).
- Prioritize weird, surprising, scandalous, or counterintuitive facts over famous/well-known ones
- Each factoid should be 2-3 punchy sentences — bar-conversation length
- Never start with "Did you know"
- Tone: casual, punchy, slightly smug — like a charming guy who knows too much
- Make each feel like a genuine gem, not a Wikipedia summary
- Include specific years, names, or numbers when possible

Return ONLY valid JSON array with exactly 5 objects, each having:
- "factoid": string (the 2-3 sentence fact)
- "year": string (the approximate year or decade, e.g. "1923" or "1890s")
- "category": string (exactly one of: crime, science, culture, politics, sports, weird, food, architecture, nature)

JSON only, no markdown, no explanation.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let factoids: Factoid[];
    try {
      factoids = JSON.parse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        res.status(500).json({ error: "Failed to parse AI response" });
        return;
      }
      factoids = JSON.parse(jsonMatch[0]);
    }

    factoidCache.set(cacheKey, { factoids, timestamp: Date.now() });

    res.json({ factoids, cached: false });
  } catch (err) {
    req.log.error({ err }, "Error generating factoids");
    res.status(500).json({ error: "Failed to generate factoids" });
  }
});

router.post("/kapit/wildcard", async (_req, res) => {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Give me 1 completely random, fascinating, conversation-worthy historical factoid from ANYWHERE in the world. Same rules — weird, surprising, bar-conversation tone, 2-3 sentences. Never start with "Did you know". Tone: casual, punchy, slightly smug.

Return ONLY valid JSON object with:
- "factoid": string (the 2-3 sentence fact)
- "year": string (the approximate year or decade, e.g. "1923" or "1890s")
- "category": string (exactly one of: crime, science, culture, politics, sports, weird, food, architecture, nature)

JSON only, no markdown, no explanation.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      res.status(500).json({ error: "Unexpected response from AI" });
      return;
    }

    let factoid: Factoid;
    try {
      factoid = JSON.parse(content.text);
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        res.status(500).json({ error: "Failed to parse AI response" });
        return;
      }
      factoid = JSON.parse(jsonMatch[0]);
    }

    res.json({ factoid });
  } catch (err) {
    req.log.error({ err }, "Error generating wildcard factoid");
    res.status(500).json({ error: "Failed to generate wildcard factoid" });
  }
});

export default router;
