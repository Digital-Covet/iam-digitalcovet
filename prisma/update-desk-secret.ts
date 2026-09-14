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
  const plainSecret = process.env.OAUTH_CLIENT_SECRET_DESK;
  if (!plainSecret) {
    console.error("OAUTH_CLIENT_SECRET_DESK is not set in .env");
    process.exit(1);
  }

  const hashedSecret = hashClientSecret(plainSecret);

  const deskRedirectUris = [
    "https://desk.flonion.com/api/auth/callback/desk",
    "http://localhost:3000/api/auth/callback/desk",
  ];
  const deskLogoutUris = [
    "https://desk.flonion.com",
    "http://localhost:3000",
  ];

  const client = await prisma.oauthClient.findUnique({
    where: { clientId: "desk" },
  });

  if (!client) {
    console.error("OAuth client 'desk' not found in database. Run the full seed first.");
    process.exit(1);
  }

  await prisma.oauthClient.update({
    where: { clientId: "desk" },
    data: {
      clientSecret: hashedSecret,
      redirectUris: deskRedirectUris,
      postLogoutRedirectUris: deskLogoutUris,
      uri: "https://desk.flonion.com",
    },
  });

  console.log("Updated OAuth client 'desk': secret hash, redirect URIs, logout URIs");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());