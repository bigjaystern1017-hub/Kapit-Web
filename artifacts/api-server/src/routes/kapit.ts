import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

const factoidCache = new Map<string, { factoids: Factoid[]; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000;

interface Factoid {
  factoid: string;
  year: string;
  category: string;
  location?: string;
}

router.post("/kapit/factoids", async (req, res) => {
  const startedAt = Date.now();
  try {
    const {
      lat,
      lng,
      locationName,
      count = 3,
      seenTopics = [],
      expandRadius = false,
      wildcardMode = false,
    } = req.body as {
      lat: number;
      lng: number;
      locationName: string;
      count?: number;
      seenTopics?: string[];
      expandRadius?: boolean;
      wildcardMode?: boolean;
    };
    console.log("[kapit-api] /kapit/factoids hit", { lat, lng, locationName, count, expandRadius, wildcardMode, seenTopics: seenTopics.length });

    if (lat === undefined || lng === undefined || !locationName) {
      console.log("[kapit-api] /kapit/factoids 400 missing fields");
      res.status(400).json({ error: "lat, lng, and locationName are required" });
      return;
    }

    const mode: "normal" | "broad" | "wildcard" = wildcardMode ? "wildcard" : expandRadius ? "broad" : "normal";
    const bypassCache = seenTopics.length > 0 || wildcardMode;
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}${expandRadius ? "-broad" : ""}`;

    if (!bypassCache) {
      const cached = factoidCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        console.log("[kapit-api] /kapit/factoids cache hit", cacheKey, cached.factoids.length, "facts");
        res.json({ factoids: cached.factoids, mode: "normal", cached: true });
        return;
      }
    }
    console.log("[kapit-api] /kapit/factoids calling Anthropic", { cacheKey, count, mode });

    const requestedCount = Math.max(1, Math.min(count, 8));
    const radius = expandRadius ? 50 : 10;

    const avoidClause = seenTopics.length > 0
      ? `\n- CRITICAL: The user has already heard these facts. Do NOT repeat or even overlap with these topics:\n  ${seenTopics.slice(0, 15).map((t, i) => `${i + 1}. "${t.slice(0, 80)}"`).join("\n  ")}\n- Dig deeper: obscure history, forgotten scandals, unusual laws, local food history, lesser-known people, strange architecture details. Think beyond the obvious.`
      : "";

    let promptContent: string;

    if (wildcardMode) {
      promptContent = `You are a brilliant, slightly insufferable cocktail party historian. Give me ${requestedCount} completely random, fascinating historical factoid${requestedCount > 1 ? "s" : ""} from ANYWHERE in the world — different continents, different centuries, completely different topics.

Rules:
- Each factoid must be about a DIFFERENT topic, person, and place
- Prioritize weird, surprising, scandalous, or counterintuitive facts over famous/well-known ones
- Each factoid should be 2-3 punchy sentences — bar-conversation length
- Never start with "Did you know"
- Tone: casual, punchy, slightly smug — like a charming person who knows too much
- Include specific years, names, or numbers when possible${avoidClause}

Return ONLY valid JSON array with exactly ${requestedCount} object${requestedCount > 1 ? "s" : ""}, each having:
- "factoid": string (the 2-3 sentence fact)
- "year": string (the approximate year or decade, e.g. "1923" or "1890s")
- "category": string (exactly one of: crime, science, culture, politics, sports, weird, food, architecture, nature)
- "location": string (the specific city and country, e.g. "Vienna, Austria" or "Kyoto, Japan")

JSON only, no markdown, no explanation.`;
    } else {
      promptContent = `You are a brilliant, slightly insufferable cocktail party historian. Give me ${requestedCount} fascinating, unexpected, conversation-worthy historical factoid${requestedCount > 1 ? "s" : ""} about places within roughly ${radius} miles of these coordinates: ${lat}, ${lng} (near ${locationName}).

Rules:
- Each factoid must be about a DIFFERENT topic, person, and location within the radius
- Prioritize weird, surprising, scandalous, or counterintuitive facts over famous/well-known ones
- Each factoid should be 2-3 punchy sentences — bar-conversation length
- Never start with "Did you know"
- Tone: casual, punchy, slightly smug — like a charming person who knows too much
- Include specific years, names, or numbers when possible
- Cover different centuries and types of people — food history, crime, forgotten figures, unusual buildings, strange laws${avoidClause}
${expandRadius ? `- Since the radius is ${radius} miles, facts may come from the wider metro area — include the specific neighborhood, district, or city in the "location" field so the user knows where it happened` : ""}

Return ONLY valid JSON array with exactly ${requestedCount} object${requestedCount > 1 ? "s" : ""}, each having:
- "factoid": string (the 2-3 sentence fact)
- "year": string (the approximate year or decade, e.g. "1923" or "1890s")
- "category": string (exactly one of: crime, science, culture, politics, sports, weird, food, architecture, nature)${expandRadius ? `\n- "location": string (specific neighborhood, district, or city — e.g. "The Bronx, NY" or "Jersey City, NJ")` : ""}

JSON only, no markdown, no explanation.`;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      messages: [{ role: "user", content: promptContent }],
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

    if (!bypassCache) {
      factoidCache.set(cacheKey, { factoids, timestamp: Date.now() });
    }

    console.log("[kapit-api] /kapit/factoids ok", { ms: Date.now() - startedAt, count: factoids.length, mode });
    res.json({ factoids, mode, cached: false });
  } catch (err) {
    console.error("[kapit-api] /kapit/factoids error", { ms: Date.now() - startedAt, err });
    req.log.error({ err }, "Error generating factoids");
    res.status(500).json({ error: "Failed to generate factoids" });
  }
});

router.post("/kapit/wildcard", async (_req, res) => {
  const startedAt = Date.now();
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
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

    console.log("[kapit-api] /kapit/wildcard ok", { ms: Date.now() - startedAt });
    res.json({ factoid });
  } catch (err) {
    console.error("[kapit-api] /kapit/wildcard error", { ms: Date.now() - startedAt, err });
    req.log.error({ err }, "Error generating wildcard factoid");
    res.status(500).json({ error: "Failed to generate wildcard factoid" });
  }
});

export default router;
