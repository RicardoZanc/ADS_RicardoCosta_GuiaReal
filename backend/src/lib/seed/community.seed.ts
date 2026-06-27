import { prisma } from "../prisma";
import type { SeedCommunity, SeedNodes, SeedProducts, SeedUsers } from "./types";

type CommunityInput = {
  nodes: SeedNodes;
  users: SeedUsers;
  products: SeedProducts;
};

export async function seedCommunity({
  nodes,
  users,
  products,
}: CommunityInput): Promise<SeedCommunity> {
  const [rgOpinion, stratOpinion, monitorOpinion, floydNodeOpinion, ipsNodeOpinion, xpsOpinion] =
    await Promise.all([
      prisma.opinions.create({
        data: {
          user_id: users.admin.id,
          product_id: products.rg350dxz.id,
          title: "Excelente para Shred, mas a ponte exige paciência",
          content:
            "O braço é extremamente confortável e a captação responde bem ao ganho. No entanto, a ponte de microafinação Floyd Rose torna a troca de cordas demorada.",
          status: "PENDING",
          cached_upvotes: 5,
        },
      }),
      prisma.opinions.create({
        data: {
          user_id: users.user.id,
          product_id: products.playerStrat.id,
          title: "Clássico versátil para estúdio e palco",
          content:
            "Som limpo cristalino e drive suave. A ponte fixa facilita manutenção e afinação estável em turnês.",
          status: "PROCESSED",
          cached_upvotes: 3,
        },
      }),
      prisma.opinions.create({
        data: {
          user_id: users.mod.id,
          product_id: products.ultraSharp.id,
          title: "Cores fiéis, mas preço salgado",
          content:
            "O painel IPS entrega ângulos de visão excelentes para edição de fotos. O custo-benefício só compensa para uso profissional.",
          status: "PENDING",
          cached_upvotes: 2,
        },
      }),
      prisma.opinions.create({
        data: {
          user_id: users.admin.id,
          node_id: nodes.tecnologias.floydRose.id,
          title: "Microafinação extrema com trade-off de manutenção",
          content:
            "A Floyd Rose permite bends agressivos sem perder afinação, mas exige conhecimento para trocar cordas e ajustar contrapressão.",
          status: "PROCESSED",
          cached_upvotes: 8,
        },
      }),
      prisma.opinions.create({
        data: {
          user_id: users.user.id,
          node_id: nodes.tecnologias.painelIps.id,
          title: "IPS ainda é referência para trabalho criativo",
          content:
            "Painéis IPS mantêm consistência de cor entre diferentes ângulos, ideal para design e fotografia.",
          status: "PENDING",
          cached_upvotes: 1,
        },
      }),
      prisma.opinions.create({
        data: {
          user_id: users.mod.id,
          product_id: products.xps15.id,
          title: "Potente, mas aquece sob carga pesada",
          content:
            "Desempenho excelente em compilação e renderização. O chassi de alumínio ajuda, mas ventoinhas ficam audíveis em cargas sustentadas.",
          status: "PENDING",
          cached_upvotes: 4,
        },
      }),
    ]);

  const rgThread = await prisma.discussion_threads.create({
    data: {
      opinion_id: rgOpinion.id,
      user_id: users.user.id,
      content:
        "Vale a pena lubrificar os carrinhos da ponte para não perder a afinação com bends agressivos.",
      status: "PENDING",
      cached_upvotes: 3,
    },
  });

  const rgReply = await prisma.discussion_threads.create({
    data: {
      opinion_id: rgOpinion.id,
      parent_interaction_id: rgThread.id,
      user_id: users.mod.id,
      content:
        "Concordo. Uso óleo de máquina de costura nos pivôs — faz diferença na estabilidade.",
      status: "PENDING",
      cached_upvotes: 2,
    },
  });

  const rgNestedReply = await prisma.discussion_threads.create({
    data: {
      opinion_id: rgOpinion.id,
      parent_interaction_id: rgReply.id,
      user_id: users.admin.id,
      content: "Boa dica! Evitem WD-40 — resseca com o tempo.",
      status: "PENDING",
      cached_upvotes: 1,
    },
  });

  const stratThread = await prisma.discussion_threads.create({
    data: {
      opinion_id: stratOpinion.id,
      user_id: users.admin.id,
      content: "A ponte fixa é imbatível para quem grava muito em casa.",
      status: "PROCESSED",
      cached_upvotes: 4,
    },
  });

  const floydThread = await prisma.discussion_threads.create({
    data: {
      opinion_id: floydNodeOpinion.id,
      user_id: users.user.id,
      content:
        "Ponte fixa mantém melhor afinação para iniciantes que ainda não dominam ajuste de contrapressão.",
      status: "PROCESSED",
      cached_upvotes: 6,
    },
  });

  const monitorThread = await prisma.discussion_threads.create({
    data: {
      opinion_id: monitorOpinion.id,
      user_id: users.user.id,
      content:
        "Para gaming, um painel 144Hz pode ser mais interessante que IPS puro nesta faixa de preço.",
      status: "PENDING",
      cached_upvotes: 0,
    },
  });

  const processedThread = await prisma.discussion_threads.create({
    data: {
      opinion_id: floydNodeOpinion.id,
      user_id: users.mod.id,
      content:
        "Com contrapressão bem calibrada, a Floyd Rose segura afinação mesmo com uso intenso de tremolo.",
      status: "PROCESSED",
      cached_upvotes: 7,
    },
  });

  await prisma.reaction_votes.createMany({
    data: [
      { user_id: users.admin.id, opinion_id: rgOpinion.id, vote_type: 1 },
      { user_id: users.mod.id, opinion_id: rgOpinion.id, vote_type: 1 },
      { user_id: users.user.id, opinion_id: floydNodeOpinion.id, vote_type: 1 },
      { user_id: users.admin.id, interaction_id: rgThread.id, vote_type: 1 },
      { user_id: users.mod.id, interaction_id: floydThread.id, vote_type: 1 },
      { user_id: users.user.id, interaction_id: floydThread.id, vote_type: -1 },
      { user_id: users.admin.id, interaction_id: processedThread.id, vote_type: 1 },
    ],
  });

  await prisma.reports.create({
    data: {
      reporter_id: users.mod.id,
      target_interaction_id: monitorThread.id,
      reason: "SPAM",
      status: "PENDING",
    },
  });

  return {
    opinions: {
      rgOpinion,
      stratOpinion,
      monitorOpinion,
      floydNodeOpinion,
      ipsNodeOpinion,
      xpsOpinion,
    },
    threads: {
      rgThread,
      rgReply,
      rgNestedReply,
      stratThread,
      floydThread,
      monitorThread,
      processedThread,
    },
  };
}
