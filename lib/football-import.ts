import { slugify } from "@/lib/slug";

export type ImportPlayerCandidate = {
  name: string;
  slug: string;
  position?: string;
  ageGroup?: string;
  currentAcademy?: string;
  bio: string;
  achievements: Array<{
    title: string;
    description?: string;
    date?: string;
    category: "INTERNATIONAL" | "NATIONAL" | "DOMESTIC";
    sourceUrls: string[];
  }>;
  tournaments: Array<{
    name: string;
    status: "PAST" | "CURRENT" | "UPCOMING";
    notes?: string;
    sourceUrls: string[];
  }>;
  socialLinks: Record<string, string>;
  sourceUrls: string[];
};

export type ImportPersonCandidate = {
  name: string;
  slug: string;
  roleTitle: string;
  organization?: string;
  bio: string;
  contributionSummary: string;
  socialLinks: Record<string, string>;
  sourceUrls: string[];
};

export type FootballImportResult = {
  sport: "football";
  focus: string;
  generatedAt: string;
  storageRecommendation: string;
  imagePolicy: {
    maxBytes: number;
    formats: string[];
    note: string;
  };
  sources: Array<{ title: string; url: string; status: "checked" | "seeded" }>;
  players: ImportPlayerCandidate[];
  people: ImportPersonCandidate[];
  tournaments: Array<{
    name: string;
    status: "PAST" | "CURRENT" | "UPCOMING";
    streamingInfo?: string;
    sourceUrls: string[];
  }>;
};

const sources = [
  {
    title: "Minerva Academy official site",
    url: "https://minervaacademyfc.com/",
  },
  {
    title: "Minerva Academy Instagram",
    url: "https://www.instagram.com/minervaacademyfc/",
  },
  {
    title: "All India Football Federation",
    url: "https://www.the-aiff.com/",
  },
  {
    title: "Indian Super League",
    url: "https://www.indiansuperleague.com/",
  },
  {
    title: "FIFA+",
    url: "https://www.fifa.com/fifaplus/",
  },
];

async function checkSource(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "IndiaSportsAdminBot/0.1 (+https://india-sports.local/admin)",
      },
      next: { revalidate: 1800 },
    });

    return response.ok ? "checked" : "seeded";
  } catch {
    return "seeded";
  }
}

export async function buildFootballImport(
  focus = "Minerva Academy Indian youth football"
): Promise<FootballImportResult> {
  const checkedSources = await Promise.all(
    sources.map(async (source) => ({
      ...source,
      status: (await checkSource(source.url)) as "checked" | "seeded",
    }))
  );

  const minervaSources = [
    "https://minervaacademyfc.com/",
    "https://www.instagram.com/minervaacademyfc/",
    "https://www.the-aiff.com/",
  ];

  const players: ImportPlayerCandidate[] = [
    {
      name: "Mohammad Razin P",
      slug: slugify("Mohammad Razin P"),
      position: "Goalkeeper",
      ageGroup: "U-14",
      currentAcademy: "Minerva Academy",
      bio:
        "Youth goalkeeper from Kerala associated with Minerva Academy. Imported as a review draft because youth-player details should be verified against academy and tournament sources before publishing.",
      achievements: [
        {
          title: "Selected for Al Nassr U-14 youth opportunity",
          description:
            "Reported as a Minerva Academy youth prospect selected for an Al Nassr U-14 opportunity.",
          category: "INTERNATIONAL",
          sourceUrls: minervaSources,
        },
      ],
      tournaments: [
        {
          name: "Minerva Academy youth development fixtures",
          status: "CURRENT",
          notes:
            "Use AIFF, academy posts, and tournament organizers to attach exact match dates before publishing.",
          sourceUrls: minervaSources,
        },
      ],
      socialLinks: {},
      sourceUrls: minervaSources,
    },
    {
      name: "Wahengbam Raj Singh",
      slug: slugify("Wahengbam Raj Singh"),
      position: "Forward",
      ageGroup: "Youth",
      currentAcademy: "Minerva Academy",
      bio:
        "Minerva Academy attacking prospect imported for admin review. Add DOB, hometown, verified image, and exact competition history from academy or AIFF records.",
      achievements: [
        {
          title: "High-scoring youth football season with Minerva Academy",
          description:
            "Seeded from public reporting on Minerva Academy youth scorers; verify exact goal tally and season before publishing.",
          category: "DOMESTIC",
          sourceUrls: minervaSources,
        },
      ],
      tournaments: [
        {
          name: "AIFF youth competitions",
          status: "CURRENT",
          notes: "Attach AIFF competition and match pages after manual review.",
          sourceUrls: ["https://www.the-aiff.com/"],
        },
      ],
      socialLinks: {},
      sourceUrls: minervaSources,
    },
    {
      name: "Punshiba Meitei",
      slug: slugify("Punshiba Meitei"),
      position: "Forward",
      ageGroup: "Youth",
      currentAcademy: "Minerva Academy",
      bio:
        "Minerva Academy youth forward imported as a source-linked draft for football admin review.",
      achievements: [
        {
          title: "Recognized among Minerva Academy youth attackers",
          category: "DOMESTIC",
          sourceUrls: minervaSources,
        },
      ],
      tournaments: [
        {
          name: "AIFF youth competitions",
          status: "CURRENT",
          sourceUrls: ["https://www.the-aiff.com/"],
        },
      ],
      socialLinks: {},
      sourceUrls: minervaSources,
    },
    {
      name: "Azam Khan",
      slug: slugify("Azam Khan Minerva Academy football"),
      position: "Forward",
      ageGroup: "Youth",
      currentAcademy: "Minerva Academy",
      bio:
        "Minerva Academy youth player draft. Review academy posts and match reports before setting the page to published.",
      achievements: [
        {
          title: "Youth academy match-impact reports",
          category: "DOMESTIC",
          sourceUrls: minervaSources,
        },
      ],
      tournaments: [
        {
          name: "Minerva Academy youth fixtures",
          status: "CURRENT",
          sourceUrls: minervaSources,
        },
      ],
      socialLinks: {},
      sourceUrls: minervaSources,
    },
  ];

  return {
    sport: "football",
    focus,
    generatedAt: new Date().toISOString(),
    storageRecommendation:
      "Use Supabase Storage on the free tier for profile and gallery images. Store public URLs in Prisma, keep originals out of Git, and use the local public/uploads fallback only for development.",
    imagePolicy: {
      maxBytes: 500 * 1024,
      formats: ["image/jpeg", "image/png", "image/webp"],
      note:
        "The admin upload UI compresses images in-browser before saving and the server rejects anything above 500 KB.",
    },
    sources: checkedSources,
    players,
    people: [
      {
        name: "Ranjit Bajaj",
        slug: slugify("Ranjit Bajaj"),
        roleTitle: "Football academy founder and youth football promoter",
        organization: "Minerva Academy",
        bio:
          "Indian football administrator and founder associated with Minerva Academy, known for investing in youth development pathways and surfacing young football talent.",
        contributionSummary:
          "Create a contributor page covering academy building, grassroots scouting, youth tournament exposure, and public advocacy for Indian football.",
        socialLinks: {},
        sourceUrls: minervaSources,
      },
    ],
    tournaments: [
      {
        name: "AIFF youth competitions",
        status: "CURRENT",
        streamingInfo:
          "Check AIFF match centre, club channels, and tournament organizer YouTube links during manual review.",
        sourceUrls: ["https://www.the-aiff.com/"],
      },
      {
        name: "Minerva Academy domestic and international youth tours",
        status: "UPCOMING",
        streamingInfo:
          "Often announced through academy social handles; admin should attach verified stream links per event.",
        sourceUrls: minervaSources,
      },
    ],
  };
}
