import { prisma } from "../prisma";
import { clearDatabase } from "./clearDatabase";
import { seedCommunity } from "./community.seed";
import { seedNodes } from "./nodes.seed";
import { seedProducts } from "./products.seed";
import { seedTechnicalFacts } from "./technicalFacts.seed";
import { logUserCredentials, seedUsers } from "./users.seed";
import type { SeedContext } from "./types";

export async function main(): Promise<SeedContext> {
  console.log("Iniciando seeding do banco de dados...");

  await clearDatabase();

  const nodes = await seedNodes();
  const users = await seedUsers();
  const products = await seedProducts(nodes);
  const community = await seedCommunity({ nodes, users, products });
  // const technicalFacts = await seedTechnicalFacts({ nodes, community });

  const context: SeedContext = {
    nodes,
    users,
    products,
    community,
    // technicalFacts,
  };

  console.log("Seeding finalizado com sucesso!");
  logUserCredentials();

  return context;
}

main()
  .catch((error) => {
    console.error("Erro durante o seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
