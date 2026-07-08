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

async function patchClient(clientId, rawSecret) {
  const hashedSecret = hashClientSecret(rawSecret);

  const client = await prisma.oauthClient.findUnique({
    where: { clientId },
  });

  if (!client) {
    console.error(`OAuth client '${clientId}' not found in database`);
    return false;
  }

  if (client.clientSecret === hashedSecret) {
    console.log(`'${clientId}' secret already correct — skipping.`);
    return true;
  }

  await prisma.oauthClient.update({
    where: { clientId },
    data: { clientSecret: hashedSecret },
  });

  const verify = await prisma.oauthClient.findUnique({
    where: { clientId },
    select: { clientSecret: true },
  });
  console.log(`Updated '${clientId}' secret. Verified: ${verify.clientSecret}`);
  return true;
}

async function main() {
  const portfolioSecret = process.env.OAUTH_CLIENT_SECRET;
  if (!portfolioSecret) {
    console.error("OAUTH_CLIENT_SECRET env var is not set");
    process.exit(1);
  }

  const shareSecret = process.env.OAUTH_CLIENT_SECRET_SHARE;
  if (!shareSecret) {
    console.error("OAUTH_CLIENT_SECRET_SHARE env var is not set");
    process.exit(1);
  }

  console.log("=== Portfolio client ===");
  await patchClient("portfolio", portfolioSecret);

  console.log("\n=== Share client ===");
  await patchClient("share", shareSecret);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
