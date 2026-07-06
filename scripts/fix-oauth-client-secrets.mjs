import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaClient } from "@generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function hashClientSecret(secret) {
  return createHash("sha256").update(secret, "utf8").digest("base64url");
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const rawSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!rawSecret) {
    console.error("OAUTH_CLIENT_SECRET env var is not set");
    process.exit(1);
  }

  const hashedSecret = hashClientSecret(rawSecret);

  console.log("Raw secret length:", rawSecret.length);
  console.log("Hashed secret (base64url):", hashedSecret);
  console.log("Hashed secret length:", hashedSecret.length);

  const client = await prisma.oauthClient.findUnique({
    where: { clientId: "portfolio" },
  });

  if (!client) {
    console.error("OAuth client 'portfolio' not found in database");
    process.exit(1);
  }

  console.log("\nCurrent DB clientSecret:", client.clientSecret);
  console.log("Current DB clientSecret length:", client.clientSecret.length);

  if (client.clientSecret === hashedSecret) {
    console.log("\nClient secret is already correctly hashed. No changes needed.");
    return;
  }

  await prisma.oauthClient.update({
    where: { clientId: "portfolio" },
    data: { clientSecret: hashedSecret },
  });

  console.log("\nUpdated portfolio client secret to hashed value.");

  const verify = await prisma.oauthClient.findUnique({
    where: { clientId: "portfolio" },
    select: { clientSecret: true },
  });
  console.log("Verified new DB clientSecret:", verify.clientSecret);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
