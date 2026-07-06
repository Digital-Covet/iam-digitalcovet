import "dotenv/config";
import { PrismaClient } from "@generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

async function main() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const client = await prisma.oauthClient.findUnique({
    where: { clientId: "portfolio" },
    select: {
      clientId: true,
      clientSecret: true,
      redirectUris: true,
      grantTypes: true,
      responseTypes: true,
      tokenEndpointAuthMethod: true,
      skipConsent: true,
      name: true,
    },
  });
  console.log(JSON.stringify(client, null, 2));
  await prisma.$disconnect();
}

main();
