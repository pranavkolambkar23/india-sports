#!/usr/bin/env node

/**
 * Fetches latest cricket news, allocates it into structured categories with AI,
 * and upserts the results into the SportsNews table.
 *
 * Manual run:
 *   npm run news:cricket
 *
 * Daily cron:
 *   Use GitHub Actions or a system cron to run the same command once per day.
 */

const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

loadEnv(".env.local");
loadEnv(".env");

const prisma = new PrismaClient();

const SOURCE_NAME = "ESPNcricinfo";
const SOURCE_URL = "https://www.espncricinfo.com";
const FEED_URL =
  process.env.CRICKET_NEWS_RSS_URL ||
  "https://www.espncricinfo.com/rss/content/story/feeds/0.xml";
const MAX_ITEMS = Number(process.env.CRICKET_NEWS_LIMIT || 20);

const CATEGORY_KEYWORDS = [
  ["INJURY", ["injury", "injured", "fitness", "ruled out"]],
  ["SQUAD", ["squad", "picked", "selected", "selection", "call-up"]],
  ["MATCH_REPORT", ["beat", "win", "won", "defeat", "draw", "score", "wicket"]],
  ["TOURNAMENT", ["ipl", "world cup", "champions trophy", "trophy", "series"]],
  ["GOVERNANCE", ["bcci", "icc", "board", "sanction", "ban", "policy"]],
  ["PLAYER_STORY", ["captain", "batter", "bowler", "allrounder", "player"]],
];

function loadEnv(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^["']|["']$/g, "");

    if (!process.env[key]) process.env[key] = value;
  }
}

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function getTag(xml, tagName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return match ? decodeXml(match[1]) : null;
}

function getAttribute(xml, tagName, attributeName) {
  const match = xml.match(new RegExp(`<${tagName}[^>]*${attributeName}=["']([^"']+)["'][^>]*>`, "i"));
  return match ? decodeXml(match[1]) : null;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function parseRss(xml) {
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)]
    .map(([itemXml]) => {
      const title = getTag(itemXml, "title");
      const externalUrl = getTag(itemXml, "link");
      const description = getTag(itemXml, "description");
      const pubDate = getTag(itemXml, "pubDate");
      const imageUrl =
        getAttribute(itemXml, "media:content", "url") ||
        getAttribute(itemXml, "enclosure", "url");

      if (!title || !externalUrl) return null;

      return {
        title,
        externalUrl,
        description,
        imageUrl,
        publishedAt: pubDate ? new Date(pubDate) : null,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_ITEMS);
}

function fallbackAllocation(item) {
  const haystack = `${item.title} ${item.description || ""}`.toLowerCase();
  const match = CATEGORY_KEYWORDS.find(([, keywords]) =>
    keywords.some((keyword) => haystack.includes(keyword))
  );

  const category = match ? match[0] : "GENERAL";
  const tags = [
    "cricket",
    category.toLowerCase().replace(/_/g, "-"),
    ...["india", "bcci", "ipl", "icc"].filter((tag) => haystack.includes(tag)),
  ];

  return {
    summary: item.description || item.title,
    category,
    importance: category === "GENERAL" ? 3 : 4,
    aiTags: [...new Set(tags)].slice(0, 8),
    aiPayload: { provider: "fallback-keywords" },
  };
}

async function allocateWithGemini(item) {
  if (!process.env.GEMINI_API_KEY) return fallbackAllocation(item);

  const prompt = `Classify this cricket news item for an India sports database.

Return only valid JSON in this exact shape:
{
  "summary": "one sentence, max 180 characters",
  "category": "MATCH_REPORT | INJURY | SQUAD | TOURNAMENT | GOVERNANCE | PLAYER_STORY | GENERAL",
  "importance": 1,
  "aiTags": ["lowercase-tag"]
}

Title: ${item.title}
Description: ${item.description || ""}
Source URL: ${item.externalUrl}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    if (!response.ok) {
      console.warn(`Gemini allocation failed (${response.status}); using keyword fallback.`);
      return fallbackAllocation(item);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackAllocation(item);

    const parsed = JSON.parse(jsonMatch[0]);
    const fallback = fallbackAllocation(item);

    return {
      summary: parsed.summary || fallback.summary,
      category: parsed.category || fallback.category,
      importance: Math.min(5, Math.max(1, Number(parsed.importance || fallback.importance))),
      aiTags: Array.isArray(parsed.aiTags) && parsed.aiTags.length ? parsed.aiTags.slice(0, 10) : fallback.aiTags,
      aiPayload: { provider: "gemini-1.5-flash", raw: parsed },
    };
  } catch (error) {
    console.warn(`Gemini allocation errored; using keyword fallback. ${error.message}`);
    return fallbackAllocation(item);
  }
}

async function ensureCricketSport() {
  return prisma.sport.upsert({
    where: { slug: "cricket" },
    update: {},
    create: {
      name: "Cricket",
      slug: "cricket",
      icon: "🏏",
      color: "#16a34a",
      description: "Cricket news, tournaments, players, and live updates.",
    },
  });
}

async function main() {
  console.log(`Fetching cricket news from ${FEED_URL}`);
  const response = await fetch(FEED_URL, {
    headers: {
      "User-Agent": "IndiaSportsBot/1.0 (+https://example.com)",
      Accept: "application/rss+xml, application/xml, text/xml",
    },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed with ${response.status} ${response.statusText}`);
  }

  const cricket = await ensureCricketSport();
  const items = parseRss(await response.text());
  console.log(`Found ${items.length} cricket news items.`);

  let upserted = 0;

  for (const item of items) {
    const allocation = await allocateWithGemini(item);
    const slug = slugify(`${item.title}-${item.publishedAt?.getTime() || Date.now()}`);

    await prisma.sportsNews.upsert({
      where: { externalUrl: item.externalUrl },
      update: {
        title: item.title,
        summary: allocation.summary,
        imageUrl: item.imageUrl,
        category: allocation.category,
        importance: allocation.importance,
        aiTags: allocation.aiTags,
        aiPayload: allocation.aiPayload,
        publishedAt: item.publishedAt,
        fetchedAt: new Date(),
      },
      create: {
        title: item.title,
        slug,
        summary: allocation.summary,
        externalUrl: item.externalUrl,
        sourceName: SOURCE_NAME,
        sourceUrl: SOURCE_URL,
        imageUrl: item.imageUrl,
        category: allocation.category,
        importance: allocation.importance,
        aiTags: allocation.aiTags,
        aiPayload: allocation.aiPayload,
        publishedAt: item.publishedAt,
        sportId: cricket.id,
      },
    });

    upserted += 1;
  }

  console.log(`Upserted ${upserted} cricket news items.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
