import "dotenv/config";

import { eq } from "drizzle-orm";

import { db, sponsorSlots } from "../lib/schema";

const LOGO_URL =
  "https://images.unsplash.com/photo-1602934445884-da0fa1c9d3b3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bG9nb3xlbnwwfHwwfHx8MA%3D%3D";

async function updateSponsorLogos() {
  console.log("Starting logo migration for all sponsors...");

  // Fetch all sponsors
  const allSponsors = await db.query.sponsorSlots.findMany();

  console.log(`Found ${allSponsors.length} sponsors to update`);

  let updatedCount = 0;

  for (const sponsor of allSponsors) {
    // Update the sponsor with the new logo URL
    await db
      .update(sponsorSlots)
      .set({ logo: LOGO_URL })
      .where(eq(sponsorSlots.id, sponsor.id));

    updatedCount++;
    console.log(`✓ Updated sponsor "${sponsor.title}" with logo URL`);
  }

  console.log(`\nMigration complete! Updated ${updatedCount} sponsors.`);
  process.exit(0);
}

updateSponsorLogos().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

