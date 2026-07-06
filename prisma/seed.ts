import { PrismaClient } from '@prisma/client';
import { sports, tournaments, players, achievements } from '../lib/data';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Seed Sports
  for (const s of sports) {
    const sport = await prisma.sport.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        icon: s.icon,
        color: s.color,
      },
    });
    console.log(`Created sport: ${sport.name}`);
  }

  // Seed Tournaments
  for (const t of tournaments) {
    const tournament = await prisma.tournament.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        slug: t.slug,
        status: t.status as any,
        startDate: new Date(t.startDate),
        endDate: t.endDate ? new Date(t.endDate) : null,
        location: t.location,
        city: t.city,
        country: t.country,
        latitude: t.latitude,
        longitude: t.longitude,
        sportId: t.sportId,
        streamingPlatforms: t.streamingPlatforms,
      }
    });
    console.log(`Created tournament: ${tournament.name}`);
  }

  // Seed Players
  for (const p of players) {
    const player = await prisma.player.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        avatar: p.avatar,
        bio: p.bio,
        birthDate: p.birthDate ? new Date(p.birthDate) : null,
        birthPlace: p.birthPlace,
        position: p.position,
        socialLinks: p.socialLinks as any,
        medals: p.medals as any,
        sportId: p.sportId,
      }
    });
    console.log(`Created player: ${player.name}`);
  }

  // Seed Achievements
  for (const a of achievements) {
    const achievement = await prisma.achievement.upsert({
      where: { id: a.id },
      update: {},
      create: {
        id: a.id,
        title: a.title,
        description: a.description,
        date: new Date(a.date),
        category: a.category as any,
        sportId: a.sportId,
        playerId: a.playerId,
        teamId: a.teamId,
      }
    });
    console.log(`Created achievement: ${achievement.title}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
