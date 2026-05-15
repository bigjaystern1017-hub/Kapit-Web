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

const PERSONALITY_SUFFIX: Record<number, string> = {
  0: "",
  1: "\n- This batch: lean heavy on CELEBRITY and NIGHTLIFE. Famous people, musicians, actors, athletes, rappers who have real connections to this area. Also legendary clubs, bars, music venues, recording studios, after-hours spots that existed here.",
  2: "\n- This batch: lean heavy on CRIME and HAUNTED. Criminal history, mob activity, famous arrests, heists, unsolved cases. Also ghost stories, haunted buildings, cursed locations, creepy legends, unexplained events in this area.",
  3: "\n- This batch: lean heavy on HIDDEN and FOOD. Secret tunnels, underground infrastructure, hidden rooms, forgotten buildings, structures with dark pasts. Also the origin stories of famous restaurants, bars, dishes, and cocktails from this area.",
};

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
      promptPersonality = 0,
      promptCounter = 0,
      isRetry = false,
    } = req.body as {
      lat: number;
      lng: number;
      locationName: string;
      count?: number;
      seenTopics?: string[];
      expandRadius?: boolean;
      wildcardMode?: boolean;
      promptPersonality?: number;
      promptCounter?: number;
      isRetry?: boolean;
    };
    console.log("[kapit-api] /kapit/factoids hit", { lat, lng, locationName, count, expandRadius, wildcardMode, seenTopics: seenTopics.length, promptCounter });

    if (lat === undefined || lng === undefined || !locationName) {
      console.log("[kapit-api] /kapit/factoids 400 missing fields");
      res.status(400).json({ error: "lat, lng, and locationName are required" });
      return;
    }

    const mode: "normal" | "broad" | "wildcard" = wildcardMode ? "wildcard" : expandRadius ? "broad" : "normal";
    const bypassCache = seenTopics.length > 0 || wildcardMode || isRetry;
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}${expandRadius ? "-broad" : ""}`;
    const personalitySuffix = PERSONALITY_SUFFIX[promptPersonality % 4] ?? "";

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
    const radius = expandRadius ? 50 : 25;
    const issueNum = Math.max(1, (promptCounter % 12) + 1);

    // Anti-repeat block always appended at the end of the prompt
    const topicsSection = seenTopics.length > 0
      ? `\nTOPICS TO AVOID — user has already heard these:\n${seenTopics.slice(0, 20).map((t, i) => `  ${i + 1}. ${t.slice(0, 80)}`).join("\n")}\n`
      : "";

    const antiRepeatBlock = `
CRITICAL ANTI-REPEAT RULES:${topicsSection}
- Do NOT default to the most famous or obvious facts. Assume the user has already heard those.
- Think of this as issue #${issueNum} of a neighborhood magazine. Issue 1 = obvious landmarks and famous names. Issue 5 = things only locals know. Issue 10 = facts that would surprise even a local historian. You are writing issue #${issueNum} — go that deep.
- Each fact must cover a genuinely DIFFERENT subject: different person, different building, different decade, different type of event.
- If you cannot find ${requestedCount} truly unique facts for this exact location, expand your search to 25 miles rather than repeating anything.`;

    let promptContent: string;

    if (wildcardMode) {
      promptContent = `You are Kapit — a conversation weapon. Return ${requestedCount} fascinating, unexpected, conversation-worthy fact${requestedCount > 1 ? "s" : ""} from ANYWHERE in the world — different continents, different centuries, completely different topics.

You are NOT a tour guide. You are NOT a history teacher. You are the friend who knows EVERYTHING — the history AND the gossip AND the ghost stories AND which celebrity was involved.

FACT CATEGORIES — mix these types:
- CELEBRITY: Famous people, what they did, where they were
- CRIME: Mob hits, heists, unsolved mysteries, infamous arrests
- HAUNTED: Ghost stories, paranormal legends, cursed places, creepy history
- MUSIC & NIGHTLIFE: Legendary clubs, albums, concerts, after-hours spots
- FOOD & DRINK: Origin stories of famous restaurants, bars, dishes, cocktails
- SPORTS: Athletes, legendary matches, rivalries
- HIDDEN: Secret tunnels, buried buildings, hidden infrastructure
- HISTORY: Wild historical stories — not textbook facts${personalitySuffix}

RULES:
- 2-3 punchy sentences max — bar-conversation length
- NEVER start with "Did you know"
- Prioritize: shocking > surprising > interesting > educational
- Name-drop specific people, addresses, dates
- Casual, punchy, slightly dramatic tone
${antiRepeatBlock}

Return ONLY a valid JSON array, no markdown:
[{"factoid":"...","year":"...","category":"one of: celebrity, crime, haunted, music, food, sports, hidden, history, culture","location":"city and country"}]`;
    } else {
      promptContent = `You are Kapit — a conversation weapon. Return ${requestedCount} fascinating, unexpected, conversation-worthy fact${requestedCount > 1 ? "s" : ""} about places within roughly ${radius} miles of these coordinates: ${lat}, ${lng} (near ${locationName}).

You are NOT a tour guide. You are NOT a history teacher. You are the friend who knows EVERYTHING about this neighborhood — the history AND the gossip AND the ghost stories AND which celebrity lived on that block.

FACT CATEGORIES — every batch must include a MIX of these types:
- CELEBRITY: Which famous people lived here, grew up here, got arrested here, had their first gig here. Rappers, actors, athletes, writers, musicians — anyone with a real connection to this area
- CRIME: Mob hits, famous heists, unsolved mysteries, infamous arrests, gang history, prohibition raids, notable trials
- HAUNTED: Ghost stories, paranormal legends, cursed buildings, unexplained events, creepy local history
- MUSIC & NIGHTLIFE: Legendary clubs, albums recorded nearby, concerts, DJs or bands that got their start here, after-hours spots
- FOOD & DRINK: Origin stories of famous restaurants, bars, dishes, cocktails — speakeasies hidden in basements
- SPORTS: Athletes who trained here, legendary games nearby, boxing matches, rivalries
- HIDDEN: Secret tunnels, underground rivers, buried buildings, hidden rooms, forgotten infrastructure, structures with dark pasts
- HISTORY: Wild historical stories — only the genuinely shocking ones, not textbook facts${personalitySuffix}
${expandRadius ? `- Since the radius is ${radius} miles, facts may come from the wider metro area — include the specific neighborhood, district, or city in the "location" field` : ""}

RULES:
- 2-3 punchy sentences max — bar-conversation length
- NEVER start with "Did you know"
- Prioritize: shocking > surprising > interesting > educational
- Name-drop specific people, addresses, dates
- If a celebrity has a real connection to this area, lead with that
- For crime facts, be vivid but not gratuitous
- For haunted facts, be genuinely creepy
- Do NOT give all history facts — mix the categories
- The vibe: your coolest friend who grew up in this neighborhood
${antiRepeatBlock}

Return ONLY a valid JSON array, no markdown:
[{"factoid":"...","year":"...","category":"one of: celebrity, crime, haunted, music, food, sports, hidden, history, culture"${expandRadius ? `,"location":"specific neighborhood or city"` : ""}}]`;
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      temperature: 0.9,
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

router.post("/kapit/wildcard", async (req, res) => {
  const startedAt = Date.now();
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      temperature: 0.9,
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
