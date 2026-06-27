import { prisma } from "../prisma";
import type { SeedCommunity, SeedNodes, SeedTechnicalFacts } from "./types";

type TechnicalFactsInput = {
  nodes: SeedNodes;
  community: SeedCommunity;
};

export async function seedTechnicalFacts({
  nodes,
  community,
}: TechnicalFactsInput): Promise<SeedTechnicalFacts> {
  const [floydVerified, ipsHypothesis, humbuckerDisputed] = await Promise.all([
    prisma.technical_facts.create({
      data: {
        node_id: nodes.tecnologias.floydRose.id,
        fact_label: "Floyd Rose exige manutenção frequente para estabilidade",
        fact_description:
          "A ponte de microafinação Floyd Rose oferece estabilidade extrema com contrapressão calibrada, mas demanda lubrificação e ajuste periódico dos carrinhos.",
        consensus_score: 0.85,
        status: "VERIFIED",
        fact_evidence: {
          create: [
            { interaction_id: community.threads.floydThread.id },
            { interaction_id: community.threads.processedThread.id },
          ],
        },
      },
    }),
    prisma.technical_facts.create({
      data: {
        node_id: nodes.tecnologias.painelIps.id,
        fact_label: "IPS oferece ângulos de visão superiores para edição",
        fact_description:
          "Monitores com painel IPS mantêm fidelidade de cor em ângulos amplos, favorecendo trabalho criativo e revisão de imagem.",
        consensus_score: 0.4,
        status: "HYPOTHESIS",
      },
    }),
    prisma.technical_facts.create({
      data: {
        node_id: nodes.tecnologias.humbucker.id,
        fact_label: "Humbucker reduz ruído em ambientes com interferência",
        fact_description:
          "Captadores humbucker cancelam ruído eletromagnético por construção de bobinas em série, mas podem soar menos brilhantes que single-coils.",
        consensus_score: 0.55,
        status: "DISPUTED",
      },
    }),
  ]);

  return { floydVerified, ipsHypothesis, humbuckerDisputed };
}
