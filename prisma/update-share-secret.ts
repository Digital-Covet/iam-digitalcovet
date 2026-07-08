import "dotenv/config";
import { createHash } from "node:crypto";
import { PrismaClient } from "@generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function hashClientSecret(secret: string): string {
  const hash = createHash("sha256").update(secret, "utf8").digest();
  return Buffer.from(hash).toString("base64url");
}

async function main() {
  const plainSecret = process.env.OAUTH_CLIENT_SECRET_SHARE;
  if (!plainSecret) {
    console.error("OAUTH_CLIENT_SECRET_SHARE is not set in .env");
    process.exit(1);
  }

  const hashedSecret = hashClientSecret(plainSecret);

  const client = await prisma.oauthClient.findUnique({
    where: { clientId: "share" },
  });

  if (!client) {
    console.error("OAuth client 'share' not found in database. Run the full seed first.");
    process.exit(1);
  }

  await prisma.oauthClient.update({
    where: { clientId: "share" },
    data: { clientSecret: hashedSecret },
  });

  console.log("Updated OAuth client 'share' secret hash");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
