/**
 * Seed script for Cricket tournaments - 2026 season
 * Uses real tournament data with dynamic status based on current date
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function computeStatus(startDate: Date, endDate: Date | null): "COMPLETED" | "LIVE" | "UPCOMING" {
  const now = new Date();
  const end = endDate || startDate;

  if (now > end) return "COMPLETED";
  if (now >= startDate && now <= end) return "LIVE";
  return "UPCOMING";
}

const cricketTournaments2026 = [
  // --- International ICC Events ---
  {
    name: "ICC Men's T20 World Cup 2026",
    slug: "icc-mens-t20-wc-2026",
    description: "India won their 3rd T20 World Cup title, defeating New Zealand by 96 runs in the final at Ahmedabad. India became the first team to win consecutive T20 World Cups.",
    startDate: new Date("2026-02-07"),
    endDate: new Date("2026-03-08"),
    location: "Multiple Venues, India & Sri Lanka",
    city: "Ahmedabad",
    state: "Gujarat",
    country: "India",
    latitude: 23.0225,
    longitude: 72.5714,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },
  {
    name: "ICC Women's T20 World Cup 2026",
    slug: "icc-womens-t20-wc-2026",
    description: "The ICC Women's T20 World Cup 2026 hosted in England.",
    startDate: new Date("2026-06-10"),
    endDate: new Date("2026-07-02"),
    location: "Multiple Venues, England",
    city: "London",
    country: "England",
    latitude: 51.5074,
    longitude: -0.1278,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },

  // --- IPL ---
  {
    name: "Indian Premier League 2026 (IPL 19)",
    slug: "ipl-2026",
    description: "Royal Challengers Bengaluru won their 2nd consecutive IPL title, defeating Gujarat Titans by 5 wickets in the final. Vaibhav Sooryavanshi (RR) was the Most Valuable Player with 776 runs.",
    startDate: new Date("2026-03-28"),
    endDate: new Date("2026-05-31"),
    location: "Multiple Venues, India",
    city: "Multiple Cities",
    country: "India",
    latitude: 19.0760,
    longitude: 72.8777,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },

  // --- WPL ---
  {
    name: "Women's Premier League 2026 (WPL 3)",
    slug: "wpl-2026",
    description: "Royal Challengers Bengaluru won the WPL 2026 title.",
    startDate: new Date("2026-01-09"),
    endDate: new Date("2026-02-05"),
    location: "Multiple Venues, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },

  // --- Bilateral Series ---
  {
    name: "New Zealand Tour of India 2026 (ODIs)",
    slug: "nz-tour-india-2026-odi",
    description: "New Zealand won the ODI series 2-1 against India in January 2026.",
    startDate: new Date("2026-01-11"),
    endDate: new Date("2026-01-18"),
    location: "Multiple Venues, India",
    city: "India",
    country: "India",
    latitude: 28.6139,
    longitude: 77.2090,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },
  {
    name: "New Zealand Tour of India 2026 (T20Is)",
    slug: "nz-tour-india-2026-t20i",
    description: "India won the T20I series 3-1 against New Zealand in January 2026.",
    startDate: new Date("2026-01-21"),
    endDate: new Date("2026-01-28"),
    location: "Multiple Venues, India",
    city: "India",
    country: "India",
    latitude: 28.6139,
    longitude: 77.2090,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },
  {
    name: "Afghanistan Tour of India 2026 (Test & ODIs)",
    slug: "afg-tour-india-2026",
    description: "India defeated Afghanistan in a historic Test match by an innings and 300 runs. The tour also included 3 ODIs.",
    startDate: new Date("2026-06-06"),
    endDate: new Date("2026-06-20"),
    location: "Dharamsala, Lucknow & Chennai",
    city: "Dharamsala",
    state: "Himachal Pradesh",
    country: "India",
    latitude: 32.2190,
    longitude: 76.3234,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },
  {
    name: "India Tour of Ireland 2026 (T20Is)",
    slug: "india-tour-ireland-2026",
    description: "Ireland won the T20I series 2-0, securing their first-ever T20I series victory over India.",
    startDate: new Date("2026-06-25"),
    endDate: new Date("2026-06-28"),
    location: "Dublin, Ireland",
    city: "Dublin",
    country: "Ireland",
    latitude: 53.3498,
    longitude: -6.2603,
    streamingPlatforms: ["JioHotstar", "FanCode"],
  },
  {
    name: "India Tour of England 2026 (T20Is & ODIs)",
    slug: "india-tour-england-2026",
    description: "India tour of England featuring 5 T20Is and 3 ODIs across multiple English venues including Lord's, Manchester, and Southampton.",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-07-19"),
    location: "Multiple Venues, England",
    city: "London",
    country: "England",
    latitude: 51.5294,
    longitude: -0.1736,
    streamingPlatforms: ["JioHotstar", "Star Sports", "Sky Sports"],
  },
  {
    name: "India Tour of Zimbabwe 2026 (T20Is)",
    slug: "india-tour-zimbabwe-2026",
    description: "India tour of Zimbabwe for a 3-match T20I series at Harare Sports Club.",
    startDate: new Date("2026-07-23"),
    endDate: new Date("2026-07-26"),
    location: "Harare Sports Club, Harare",
    city: "Harare",
    country: "Zimbabwe",
    latitude: -17.7990,
    longitude: 31.0516,
    streamingPlatforms: ["JioHotstar", "FanCode"],
  },
  {
    name: "India Tour of Sri Lanka 2026 (Tests - WTC)",
    slug: "india-tour-srilanka-2026-tests",
    description: "India tour of Sri Lanka for a 2-match Test series as part of the ICC World Test Championship 2025-27 cycle. Venues: Galle International Stadium and SSC Colombo.",
    startDate: new Date("2026-08-12"),
    endDate: new Date("2026-08-30"),
    location: "Galle & Colombo, Sri Lanka",
    city: "Galle",
    country: "Sri Lanka",
    latitude: 6.0329,
    longitude: 80.2168,
    streamingPlatforms: ["JioHotstar", "Star Sports"],
  },

  // --- Domestic (2026-27 Season) ---
  {
    name: "Duleep Trophy 2026-27",
    slug: "duleep-trophy-2026-27",
    description: "The 2026-27 domestic season kicks off with the Duleep Trophy at the BCCI Centre of Excellence, Bengaluru, featuring 6 zonal teams.",
    startDate: new Date("2026-08-23"),
    endDate: new Date("2026-09-10"),
    location: "BCCI Centre of Excellence, Bengaluru",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    latitude: 12.9716,
    longitude: 77.5946,
    streamingPlatforms: ["JioHotstar"],
  },
  {
    name: "Asian Games 2026 - Cricket",
    slug: "asian-games-2026-cricket",
    description: "Cricket at the 2026 Asian Games in Aichi-Nagoya, Japan. Both Indian men's and women's teams are set to compete.",
    startDate: new Date("2026-09-19"),
    endDate: new Date("2026-10-04"),
    location: "Aichi-Nagoya, Japan",
    city: "Nagoya",
    country: "Japan",
    latitude: 35.1815,
    longitude: 136.9066,
    streamingPlatforms: ["JioHotstar", "Sony LIV"],
  },
  {
    name: "Irani Cup 2026",
    slug: "irani-cup-2026",
    description: "Irani Cup 2026 scheduled to be held in Srinagar. Features Ranji Trophy champions (J&K) vs Rest of India.",
    startDate: new Date("2026-10-01"),
    endDate: new Date("2026-10-05"),
    location: "Srinagar, Jammu & Kashmir",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    country: "India",
    latitude: 34.0837,
    longitude: 74.7973,
    streamingPlatforms: ["JioHotstar"],
  },
  {
    name: "Ranji Trophy 2026-27 (Phase 1)",
    slug: "ranji-trophy-2026-27-phase1",
    description: "Phase 1 of the Ranji Trophy 2026-27. Elite Group with 32 teams across 4 groups, plus 6 Plate Group teams.",
    startDate: new Date("2026-10-11"),
    endDate: new Date("2026-11-05"),
    location: "Multiple Venues, India",
    city: "Multiple Cities",
    country: "India",
    latitude: 20.5937,
    longitude: 78.9629,
    streamingPlatforms: ["JioHotstar"],
  },
];

async function main() {
  console.log("🏏 Starting Cricket 2026 tournament seeding...\n");

  // Find the cricket sport
  const cricket = await prisma.sport.findUnique({
    where: { slug: "cricket" },
  });

  if (!cricket) {
    console.error("❌ Cricket sport not found in database. Please run the main seed first.");
    process.exit(1);
  }

  console.log(`Found Cricket sport (id: ${cricket.id})\n`);

  // Delete old cricket tournaments
  const deleted = await prisma.tournament.deleteMany({
    where: { sportId: cricket.id },
  });
  console.log(`🗑️  Deleted ${deleted.count} old cricket tournament(s)\n`);

  // Upsert 2026 tournaments
  for (const t of cricketTournaments2026) {
    const status = computeStatus(t.startDate, t.endDate);

    const tournament = await prisma.tournament.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        status,
        startDate: t.startDate,
        endDate: t.endDate,
        location: t.location,
        city: t.city,
        state: t.state ?? null,
        country: t.country,
        latitude: t.latitude ?? null,
        longitude: t.longitude ?? null,
        streamingPlatforms: t.streamingPlatforms,
        sportId: cricket.id,
      },
      create: {
        name: t.name,
        slug: t.slug,
        description: t.description,
        status,
        startDate: t.startDate,
        endDate: t.endDate,
        location: t.location,
        city: t.city,
        state: t.state ?? null,
        country: t.country,
        latitude: t.latitude ?? null,
        longitude: t.longitude ?? null,
        streamingPlatforms: t.streamingPlatforms,
        sportId: cricket.id,
      },
    });

    const emoji = status === "COMPLETED" ? "✅" : status === "LIVE" ? "🔴" : "📅";
    console.log(`${emoji} [${status.padEnd(9)}] ${tournament.name}`);
  }

  console.log("\n🏏 Cricket 2026 seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
